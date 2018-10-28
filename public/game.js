var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
const mainTarget = 1000 / 60;
const inputTarget = 1000 / 60;
const networkTarget = 1000 / 10;

class View {
    constructor(width, height) {
        this.resize(width, height);
        this.mainInterval = mainTarget;
        this.inputInterval = inputTarget;
        this.networkInterval = networkTarget;

        this.lastMain = window.performance.now();
        this.lastInput = window.performance.now();
        this.lastNetwork = window.performance.now();

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
    }

    resize(width, height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        this.styleWidth = width;
        this.styleHeight = height;
        var dispRect = canvas.getBoundingClientRect();
        canvas.width = Math.round(devicePixelRatio * dispRect.right) - Math.round(devicePixelRatio * dispRect.left);
        canvas.height = Math.round(devicePixelRatio * dispRect.bottom) - Math.round(devicePixelRatio * dispRect.top);
        this.width = canvas.width;
        this.height = canvas.height;
        this.scale = Math.min(this.width, this.height);
    }

    clear() {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, this.width, this.height)
    }

    drawCircle(x, y, radius, fillCol) {
        const rX = x * this.scale + this.width / 2;
        const rY = y * this.scale + this.height / 2;
        const rRadius = radius * this.scale;
        if (rX > -rRadius && rX < this.width + rRadius && rY > -rRadius && rY < this.height + rRadius) {
            context.fillStyle = fillCol;
            context.beginPath();
            context.arc(rX, rY, rRadius, 0, 2 * Math.PI);
            context.fill();
        }
    }

    drawHollowCircle(x, y, radius, strokeCol) {
        const rX = x * this.scale + this.width / 2;
        const rY = y * this.scale + this.height / 2;
        const rRadius = radius * this.scale;
        if (rX > -rRadius && rX < this.width + rRadius && rY > -rRadius && rY < this.height + rRadius) {
            context.lineWidth = 3;
            context.strokeStyle = strokeCol;
            context.beginPath();
            context.arc(rX, rY, rRadius, 0, 2 * Math.PI);
            context.stroke();
        }
    }

    drawPolygon(x, y, sides, radius, colour, rot) {
        const rX = x * this.scale + this.width / 2;
        const rY = y * this.scale + this.height / 2;
        const rRadius = radius * this.scale;
        if (rX > -rRadius && rX < this.width + rRadius && rY > -rRadius && rY < this.height + rRadius) {
            context.beginPath();
            context.save();
            context.translate(rX, rY);
            context.rotate(rot);
            context.fillStyle = colour;
            context.lineWidth = 1;
            context.moveTo(0, -rRadius);
            for (var i = 1; i <= sides; i++) {
                context.lineTo(rRadius * Math.sin(Math.PI * 2 * i / sides), -rRadius * Math.cos(Math.PI * 2 * i / sides));
            }
            context.fill();
            context.restore();
        }
    }

    drawBackground(offX, offY) {
        const rectSize = 0.8
        var rOffX = (offX * this.scale + this.width / 2) % (rectSize * this.scale);
        var rOffY = (offY * this.scale + this.height / 2) % (rectSize * this.scale);
        for (var i = rOffX - rectSize * this.scale; i < this.width; i += rectSize * this.scale) {
            for (var j = rOffY - rectSize * this.scale; j < this.height; j += rectSize * this.scale) {
                context.strokeStyle = "#eeeeee";
                context.lineWidth = 5;
                context.strokeRect(i, j, rectSize * this.scale, rectSize * this.scale);
            }
        }
    }

    main() {
        var ms = window.performance.now();
        if (this.mainInterval > 0 && (ms - this.lastMain) > mainTarget) {
            this.mainInterval -= 0.1;
        }
        else if (this.mainInterval < 20 && (ms - this.lastMain) < mainTarget) {
            this.mainInterval += 0.1;
        }
        this.lastMain = ms;
    }

    input() {
        var ms = window.performance.now();
        if (this.inputInterval > 0 && (ms - this.lastInput) > inputTarget) {
            this.inputInterval -= 0.1;
        }
        else if (this.inputInterval < 20 && (ms - this.lastInput) < inputTarget) {
            this.inputInterval += 0.1;
        }
        this.lastInput = ms;
    }

    network() {
        var ms = window.performance.now();
        if (this.networkInterval > 0 && (ms - this.lastNetwork) > networkTarget) {
            this.networkInterval -= 0.1;
        }
        else if (this.networkInterval < 20 && (ms - this.lastNetwork) < networkTarget) {
            this.networkInterval += 0.1;
        }
        this.lastNetwork = ms;
    }
}

var v = new View(window.innerWidth * 0.8, window.innerHeight * 0.8);

window.onresize = function(evt) {
    v.resize(window.innerWidth * 0.8, window.innerHeight * 0.8);
}

window.onmousemove = function(evt) {
    v.mouseX = evt.clientX - document.getElementById("gameCanvas").offsetLeft - v.styleWidth / 2;
    v.mouseY = evt.clientY - document.getElementById("gameCanvas").offsetTop - v.styleHeight / 2;
}

window.onmousedown = function(evt) {
    v.mouseDown = true;
}

window.onmouseup = function(evt) {
    v.mouseDown = false;
}

class Shape {
    constructor(x, y, colour) {
        this.colour = colour;
        this.x = x;
        this.y = y;
    }
}

class Circle extends Shape {
    constructor(x, y, colour, radius) {
        super(x, y, colour);
        this.radius = radius;
    }

    draw(view, offX, offY) {
        view.drawCircle(this.x - offX, this.y - offY, this.radius, this.colour);
    }
}

class Polygon extends Shape {
    constructor(x, y, colour, radius, sides, rot) {
        super(x, y, colour);
        this.sides = sides;
        this.radius = radius;
        this.rot = rot;
    }

    draw(view, offX, offY) {
        view.drawPolygon(this.x - offX, this.y - offY, this.sides, this.radius, this.colour, this.rot);
    }
}

class Player extends Circle {
    constructor(x, y, colour, radius) {
        super(x, y, colour, radius);

        this.vX = 0;
        this.vY = 0;

        this.l = false;
        this.u = false;
        this.r = false;
        this.d = false;
    }

    applyForce(mod, dir) {
        this.vX += mod * Math.sin(dir);
        this.vY += mod * Math.cos(dir);
    }

    keys() {
        if (this.l) {
            this.applyForce(0.001, Math.PI * 3 / 2);
        }
        if (this.u) {
            this.applyForce(0.001, Math.PI);
        }
        if (this.r) {
            this.applyForce(0.001, Math.PI * 1 / 2);
        }
        if (this.d) {
            this.applyForce(0.001, 0);
        }
    }

    move() {
        this.x += this.vX;
        this.vX = this.vX * 0.95;
        this.y += this.vY;
        this.vY = this.vY * 0.95;
    }
}

class UserPlayer extends Player {
    constructor() {
        super(0, 0, "#cccccc", 0.01);
        this.lastCollision = 0;
    }

    collision(playerID, players) {
        for (var i = 0; i < players.length; i++) {
            if (players[i] != null && i != playerID) {
                if (Math.pow(players[playerID].x - players[i].x, 2) + Math.pow(players[playerID].y - players[i].y, 2) <= Math.pow(players[playerID].radius + players[i].radius, 2) && players[playerID].lastCollision < Date.now() - 20) {
                    players[playerID].lastCollision = Date.now();
        
                    const normalAngle = Math.atan2(players[i].y - players[playerID].y, players[i].x - players[playerID].x);
                    const mod = Math.sqrt(Math.pow(players[i].vX - players[playerID].vX, 2) + Math.pow(players[i].vY - players[playerID].vY, 2));
                    const diffVX = Math.cos(normalAngle) * mod;
                    const diffVY = Math.sin(normalAngle) * mod;
                    const newIVX = -diffVX * (players[i].radius / (players[playerID].radius + players[i].radius));
                    const newIVY = -diffVY * (players[i].radius / (players[playerID].radius + players[i].radius));
                    const newJVX = diffVX * (players[playerID].radius / (players[playerID].radius + players[i].radius));
                    const newJVY = diffVY * (players[playerID].radius / (players[playerID].radius + players[i].radius));
                            
                    players[playerID].x = players[i].x - Math.cos(normalAngle) * (players[playerID].radius + players[i].radius);
                    players[playerID].y = players[i].y - Math.sin(normalAngle) * (players[playerID].radius + players[i].radius);
                    players[playerID].vX += newIVX;
                    players[playerID].vY += newIVY;

                    players[i].vX += newJVX;
                    players[i].vY += newJVY;
                    players[i].ignoreBefore = Date.now();

                    socket.emit("collided", { causeID: playerID, playerID: i, vX: newJVX, vY: newJVY, time: players[playerID].lastCollision });
                }
            }
        }
    }

    fire(playerID, x, y) {
        const mouseAngle = Math.atan2(y, x);
        const diffVX = Math.cos(mouseAngle) * 0.03;
        const diffVY = Math.sin(mouseAngle) * 0.03;
        return {playerID: playerID, x: this.x, y: this.y, vX: this.vX + diffVX, vY: this.vY + diffVY, vRot: Math.round(Math.random() * 20) * Math.PI / 180, colour: this.colour, radius: this.radius * (Math.floor(Math.random() * 1000) / 2000), sides: Math.floor(Math.random() * 5) + 3, rot: Math.round(Math.random() * 360) * Math.PI / 180};
    }
}

var p = new UserPlayer();

class NetworkedPlayer extends Player {
    constructor(x, y, colour, radius) {
        super(x, y, colour, radius);
        
        this.aVX = 0;
        this.aVY = 0;
        this.lastUpdate = 0;
        this.ignoreBefore = 0;
    }

    move() {
        super.move();
        this.x += this.aVX;
        this.y += this.aVY;
    }
}

class Bullet extends Polygon {
    constructor(bulletID, playerID, x, y, vX, vY, vRot, colour, radius, sides, rot) {
        super(x, y, colour, radius, sides, rot);
        this.bulletID = bulletID;
        this.owner = playerID;
        this.vX = vX;
        this.vY = vY;
        this.vRot = vRot;
    }

    move() {
        this.x += this.vX;
        this.vX = this.vX * 0.98;
        this.y += this.vY;
        this.vY = this.vY * 0.98;
        this.rot += this.vRot;
    }
}

document.addEventListener('keydown', function(evt) {
    if (evt.keyCode == 37 || evt.keyCode == 65) {
        p.l = true;
    }
    else if (evt.keyCode == 38 || evt.keyCode == 87) {
        p.u = true;
    }
    else if (evt.keyCode == 39 || evt.keyCode == 68) {
        p.r = true;
    }
    else if (evt.keyCode == 40 || evt.keyCode == 83) {
        p.d = true;
    }
}, true);

document.addEventListener('keyup', function(evt) {
    if (evt.keyCode == 37 || evt.keyCode == 65) {
        p.l = false;
    }
    else if (evt.keyCode == 38 || evt.keyCode == 87) {
        p.u = false;
    }
    else if (evt.keyCode == 39 || evt.keyCode == 68) {
        p.r = false;
    }
    else if (evt.keyCode == 40 || evt.keyCode == 83) {
        p.d = false;
    }
}, true);

var socket = io();

class Networking {
    constructor(player, view) {
        this.player = player;
        this.players = [];
        this.playerID = -1;
        this.bullets = [];
        this.endBullets = [];
        this.view = view;
    }

    checkBulletCollisions() {
        for (var i = 0; i < this.bullets.length; i++) {
            for (var j = 0; j < this.players.length; j++) {
                if (this.bullets[i] != null && this.bullets[i].owner != j && this.players[j] != null) {
                    if (Math.pow(this.players[j].x - this.bullets[i].x, 2) + Math.pow(this.players[j].y - this.bullets[i].y, 2) <= Math.pow(this.players[j].radius + this.bullets[i].radius, 2)) {        
                        const normalAngle = Math.atan2(this.bullets[i].y - this.players[j].y, this.bullets[i].x - this.players[j].x);
                        const mod = Math.sqrt(Math.pow(this.bullets[i].vX - this.players[j].vX, 2) + Math.pow(this.bullets[i].vY - this.players[j].vY, 2));
                        const diffVX = Math.cos(normalAngle) * mod;
                        const diffVY = Math.sin(normalAngle) * mod;
                        const newIVX = -diffVX * (this.bullets[i].radius / (this.players[j].radius + this.bullets[i].radius));
                        const newIVY = -diffVY * (this.bullets[i].radius / (this.players[j].radius + this.bullets[i].radius));
                                
                        if (j == this.playerID) {
                            this.players[j].vX += newIVX * 0.07;
                            this.players[j].vY += newIVY * 0.07;
                        }
    
                        this.removeBullet(this.bullets[i].bulletID, j, normalAngle);
                    }
                }
            }
        }
    }

    move() {
        for (var i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i] != null) {
                this.bullets[i].move();
            }
        }
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) {
                this.players[i].move();
            }
        }
        if (this.playerID > -1) {
            this.players[this.playerID].collision(this.playerID, this.players);
        }
        this.checkBulletCollisions();
    }

    checkFire() {
        if (this.playerID > -1) {
            if (v.mouseDown == true) {
                socket.emit("bullet", this.players[this.playerID].fire(this.playerID, v.mouseX, v.mouseY));
            }
        }
    }

    draw() {
        this.view.drawBackground(-this.player.x, -this.player.y);
        for (var i = 0; i < this.endBullets.length; i++) {
            this.view.drawHollowCircle(this.endBullets[i].x - this.player.x, this.endBullets[i].y - this.player.y, this.endBullets[i].radius, this.endBullets[i].colour);
        }
        this.endBullets = [];
        for (var i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i] != null) {
                this.bullets[i].draw(this.view, this.player.x, this.player.y);
            }
        }
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i] != null && i != this.playerID) {
                this.players[i].draw(this.view, this.player.x, this.player.y);
            }
        }
        if (this.playerID > -1) {
            this.players[this.playerID].draw(this.view, this.player.x, this.player.y);
        }
    }

    broadcast() {
        if (this.playerID != -1) {
            socket.emit("move", {time: Date.now(), x: this.players[this.playerID].x, y: this.players[this.playerID].y, vX: this.players[this.playerID].vX, vY: this.players[this.playerID].vY, l: this.player.l, u: this.players[this.playerID].u, r: this.players[this.playerID].r, d: this.players[this.playerID].d} );
        }
    }

    init(playerID, players) {
        this.playerID = playerID;
        this.players = [];
        for (var i = 0; i < players.length; i++) {
            if (i != this.playerID) {
                if (players[i] == null) {
                    this.players.push(null);
                }
                else {
                    this.players.push(new NetworkedPlayer(players[i].x, players[i].y, players[i].colour, players[i].radius));
                }
            }
            else {
                this.player.radius = players[i].radius;
                this.player.x = players[i].x;
                this.player.y = players[i].y;
                this.player.colour = players[i].colour;
                this.players.push(this.player);
            }
        }
    }

    add(radius, x, y, colour) {
        this.players.push(new NetworkedPlayer(x, y, colour, radius));
    }

    addBullet(bulletID, playerID, x, y, vX, vY, vRot, colour, radius, sides, rot) {
        const elem = new Bullet(bulletID, playerID, x, y, vX, vY, vRot, colour, radius, sides, rot);
        this.bullets.push(elem);
        const that = this;
        setTimeout(function() {
            for (var i = 0; i < that.bullets.length; i++) {
                if (that.bullets[i].bulletID == bulletID) {
                    that.endBullets.push({x: elem.x, y: elem.y, colour: colour, radius: radius});
                    that.bullets.splice(i, 1);
                    break;
                }
            }
        }, 500);
    }

    removeBullet(bulletID, playerID, deg) {
        for (var i = 0; i < this.bullets.length; i++) {
            if (this.bullets[i].bulletID == bulletID) {
                this.endBullets.push({x: this.players[playerID].x + Math.cos(deg) * (this.players[playerID].radius), y: this.players[playerID].y + Math.sin(deg) * (this.players[playerID].radius), colour: this.bullets[i].colour, radius: this.bullets[i].radius});
                this.bullets.splice(i, 1);
                break;
            }
        }
    }

    remove(playerID) {
        this.players[playerID] = null;
    }

    moved(time, playerID, x, y, vX, vY, l, u, r, d) {
        if (time > this.players[playerID].ignoreBefore) {
            this.players[playerID].vX = vX;
            this.players[playerID].vY = vY;

            this.players[playerID].l = l;
            this.players[playerID].u = u;
            this.players[playerID].r = r;
            this.players[playerID].d = d;
        }

        if (window.performance.now() - this.players[playerID].lastUpdate > 0) {
            if (time > this.players[playerID].ignoreBefore + 500) {
                this.players[playerID].aVX = (x - this.players[playerID].x) * mainTarget / (window.performance.now() - this.players[playerID].lastUpdate);
                this.players[playerID].aVY = (y - this.players[playerID].y) * mainTarget / (window.performance.now() - this.players[playerID].lastUpdate);
            }
            else {
                this.players[playerID].aVX = 0;
                this.players[playerID].aVY = 0;
            }
            this.players[playerID].lastUpdate = window.performance.now();
        }
    }

    collision(originID, playerID, vX, vY, time) {
        if (playerID == this.playerID && this.players[this.playerID].lastCollision < time - 400) {
            this.players[playerID].vX += vX;
            this.players[playerID].vY += vY;
            const normalAngle = Math.atan2(this.players[playerID].y - this.players[originID].y, this.players[playerID].x - this.players[originID].x);
            this.players[playerID].x += vX * (Date.now() - time) / inputTarget;
            this.players[playerID].y += vY * (Date.now() - time) / inputTarget;
            this.players[originID].x = this.players[playerID].x - Math.cos(normalAngle) * (this.players[originID].radius + this.players[playerID].radius);
            this.players[originID].y = this.players[playerID].y - Math.sin(normalAngle) * (this.players[originID].radius + this.players[playerID].radius);
            this.players[originID].aVX = 0;
            this.players[originID].aVY = 0;
        }
    }
}

n = new Networking(p, v);

socket.on("init", function (data) {
    n.init(data.playerID, data.players);
});

socket.on("add", function(data) {
    n.add(data.player.radius, data.player.x, data.player.y, data.player.colour);
});

socket.on("remove", function(data) {
    n.remove(data.playerID);
});

socket.on("moved", function(data) {
    n.moved(data.time, data.playerID, data.x, data.y, data.vX, data.vY, data.l, data.u, data.r, data.d);
});

socket.on("collision", function(data) {
    n.collision(data.causeID, data.playerID, data.vX, data.vY, data.time);
});

socket.on("addBullet", function(data) {
    n.addBullet(data.bulletID, data.playerID, data.x, data.y, data.vX, data.vY, data.vRot, data.colour, data.radius, data.sides, data.rot);
});

function mainLoop() {
    setTimeout(function() {
        n.move();
        v.clear();
        n.draw();
        v.main();
        mainLoop();
    }, v.mainInterval);
}

mainLoop();

function inputLoop() {
    setTimeout(function() {
        p.keys();
        n.checkFire();
        v.input();
        inputLoop();
    }, v.inputInterval);
}

inputLoop();

function networkLoop() {
    setTimeout(function() {
        n.broadcast();
        v.network();
        networkLoop();
    }, v.networkInterval);
}

networkLoop();