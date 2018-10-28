var app = require("express")();
var server = require("http").Server(app);
var io = require("socket.io")(server);

var port = process.env.PORT || 80;
server.listen(port);

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/index.html", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/game.js", function (req, res) {
    res.sendFile(__dirname + "/public/game.js");
});

app.get("/style.css", function (req, res) {
    res.sendFile(__dirname + "/public/style.css");
});

app.get("/favicon.png", function (req, res) {
    res.sendFile(__dirname + "/public/favicon.png");
});

var players = [];
var playerCount = 0;
var bulletID = 0;

io.on("connection", function (socket) {
    players.push({ radius: 0.02 + Math.round(Math.random() * 200) / 10000, x: Math.round(Math.random() * 1000) / 1000, y: Math.round(Math.random() * 1000) / 1000, vX: 0, vY: 0, colour: "rgb(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ")" });
    const playerID = players.length - 1;
    socket.emit("init", { players: players, playerID: playerID });
    socket.broadcast.emit("add", { player: players[players.length - 1] });
    playerCount++;
    console.log("Player " + playerID + " joined, total players: " + playerCount);
    socket.on("move", function (data) {
        players[playerID].x = data.x;
        players[playerID].y = data.y;
        players[playerID].vX = data.vX;
        players[playerID].vY = data.vY;

        socket.volatile.broadcast.emit("moved", { time: data.time, playerID: playerID, x: data.x, y: data.y, vX: data.vX, vY: data.vY, l: data.l, u: data.u, r: data.r, d: data.d });
    });
    socket.on("disconnect", function() {
        players[playerID] = null;
        io.emit("remove", { playerID: playerID });
        playerCount--;
        if (playerCount == 0) {
            players = [];
        }
        console.log("Player " + playerID + " left, total players: " + playerCount);
    });
    socket.on("collided", function(data) {
        socket.broadcast.emit("collision", data);
    });
    socket.on("bullet", function(data) {
        io.emit("addBullet", { bulletID: bulletID, playerID: data.playerID, x: data.x, y: data.y, vX: data.vX, vY: data.vY, vRot: data.vRot, colour: data.colour, radius: data.radius, sides: data.sides, rot: data.rot });
        bulletID++;
    });
});