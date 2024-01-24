const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const LEFT = document.querySelector(".left");
const RIGHT = document.querySelector(".right");
const START_GAME = document.querySelector(".start-game");
const STATUS = document.querySelector(".start-game h1");

const CANVAS_W = CANVAS.width;
const CANVAS_H = CANVAS.height;

let vel = {
    x: 3,
    y: 3
};

let requestId = 0;
let dir;
let leftDir, rightDir;
let Enemies = [];

CTX.fillStyle = "#000";
CTX.fillRect(0, 0, CANVAS_W, CANVAS_H);

class Shape {
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }
}

class Ball extends Shape {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        CTX.fillStyle = "#fff";
        CTX.fill();
    }

    update() {
        this.x += vel.x;
        this.y -= vel.y;

        if (this.x + this.radius > CANVAS_W || this.x - this.radius < 0) {
            vel.x *= -1;
        }

        if (this.y - this.radius < 0) {
            vel.y *= -1;
        }
    }
}

class Player extends Shape {
    constructor(x, y, w, h) {
        super(x, y);
        this.w = w;
        this.h = h;
    }

    draw() {
        CTX.fillStyle = "#fff";
        CTX.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        if (leftDir && this.x > 0) {
            this.x -= 7;
        }

        if (rightDir && this.x + this.w < CANVAS_W) {
            this.x += 7;
        }

        if (collision(this)) {
            vel.y *= -1;
        }
    }
}

class Enemy extends Shape {
    constructor(x, y, w, h, color) {
        super(x, y);
        this.w = w;
        this.h = h;
        this.color = color;
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.w, this.h);
    }
}

const BALL = new Ball(CANVAS_W / 2, 354, 8);
const PLAYER = new Player(CANVAS_W / 2 - 30, 364, 60, 10);

let playerType = "player";

function animationLoop() {

    calculate();

    draw();

    requestId = requestAnimationFrame(animationLoop);
}

function calculate() {

    Enemies.forEach((enemy, index) => {
        if (collision(enemy)) {

            vel.x *= -1;
            vel.y *= -1;

            switch (enemy.color) {
                case "#fff":
                    enemy.color = "blue";
                    break;
                case "blue":
                    enemy.color = "red";
                    break;
                case "red":
                    Enemies.splice(index, 1);
                    break;
                default:
                    enemy.color = "red";
            }
        }
    });

    if (BALL.y > CANVAS_H || Enemies.length < 1) {
        cancelAnimationFrame(requestId);

        START_GAME.style.display = "block";
        if (BALL.y > CANVAS_H) {
            STATUS.innerText = "You Lose.";
        } else {
            STATUS.innerText = "You Win!";
        }
    }

    if (playerType == "bot") {
        bot();
    }

    BALL.update();
    PLAYER.update();
}

function draw() {
    
    CTX.fillStyle = "#000";
    CTX.fillRect(0, 0, CANVAS_W, CANVAS_H);

    Enemies.forEach((enemy) => enemy.draw());

    BALL.draw();
    PLAYER.draw();

}

function collision(rect) {
    distX = Math.abs(BALL.x - rect.x - rect.w / 2);
    distY = Math.abs(BALL.y - rect.y - rect.h / 2);

    if (distX > rect.w / 2 + BALL.radius || distY > rect.h / 2 + BALL.radius) {
        return false;
    }

    if (distX <= rect.w / 2 || distY <= rect.h / 2) {
        return true;
    }

    const dx = distX - rect.w / 2;
    const dy = distY - rect.h / 2;

    return dx * dx + dy * dy <= BALL.radius * BALL.radius;
}

function createEnemies() {
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 6; x++) {
            Enemies.push(new Enemy(x * 60 + 15, y * 25 + 15, 50, 15, "#fff"));
        }
    }
}

function bot() {
    if (BALL.y >= 150 && vel.y < 0) {
        if (PLAYER.x + 30 - BALL.x < -7 && PLAYER.x + PLAYER.w < CANVAS_W) {
            PLAYER.x += 7;
        }
        if (PLAYER.x + 30 - BALL.x > 7 && PLAYER.x > 0) {
            PLAYER.x -= 7;
        }
    }

    if (vel.y > 0) {
        if (PLAYER.x + 30 > CANVAS_W / 2) {
            PLAYER.x -= 5;
        }
        if (PLAYER.x + 30 < CANVAS_W / 2) {
            PLAYER.x += 5;
        }
    }
}

function addListenerMulti(element, eventNames, listener) {
    eventNames.split(" ").forEach((event) => {
        element.addEventListener(event, listener, false);
    });
}

addListenerMulti(document, "touchstart mousedown keydown", (e) => {
    if (playerType !== "player") return;
    
    if (e.target == LEFT || e.keyCode == "37") {
        leftDir = true;
    } else if (e.target == RIGHT || e.keyCode == "39") {
        rightDir = true;
    }
});

addListenerMulti(document, "touchend mouseup keyup", () => {
    leftDir = rightDir = false;
});

START_GAME.addEventListener("click", (e) => {
    playerType = (e.target.id == "bot" ? "bot" : "player");

    START_GAME.style.display = "none";

    BALL.x = CANVAS_W / 2;
    BALL.y = 354;
    PLAYER.x = CANVAS_W / 2 - 30;
    PLAYER.y = 364;

    createEnemies();
    animationLoop();
});