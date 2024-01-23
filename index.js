const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const LEFT = document.querySelector(".left");
const RIGHT = document.querySelector(".right");
const START_GAME = document.querySelector(".start-game");
const STATUS = document.querySelector(".start-game h1");

const CANVAS_W = CANVAS.width;
const CANVAS_H = CANVAS.height;

CTX.fillStyle = "#000";
CTX.fillRect(0, 0, CANVAS_W, CANVAS_H);

let vel = {
    x: 6,
    y: 6,
};

let dir;
let leftDir, rightDir;
let Enemies = [];

class Ball {
    constructor(x, y, raduis) {
        this.x = x;
        this.y = y;
        this.raduis = raduis;
    }

    draw() {
        CTX.beginPath();
        CTX.arc(this.x, this.y, this.raduis, 0, 2 * Math.PI);
        CTX.fillStyle = "#fff";
        CTX.fill();
    }

    update() {
        this.draw();
        this.x += vel.x;
        this.y -= vel.y;
        if (this.x + this.raduis > CANVAS_W || this.x - this.raduis < 0) {
            vel.x = -vel.x;
        }

        if (this.y - this.raduis < 0) {
            vel.y = -vel.y;
        }
    }
}

class Pipe {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw() {
        CTX.fillStyle = "#fff";
        CTX.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        this.draw();
        if (leftDir && this.x > 0) {
            this.x -= 7;
        }

        if (rightDir && this.x + this.w < CANVAS_W) {
            this.x += 7;
        }

        if (collision(this)) {
            vel.y = -vel.y;
        }
    }
}

class Enemy {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
    }

    draw() {
        CTX.fillStyle = this.color;
        CTX.fillRect(this.x, this.y, this.w, this.h);
    }

    update() {
        this.draw();
        if (collision(this)) {
            vel.y = -vel.y;
        }
    }
}

const ball = new Ball(CANVAS_W / 2, 354, 8);
const pipe = new Pipe(CANVAS_W / 2 - 30, 364, 60, 10);

function animate() {
    CTX.fillStyle = "#000";
    CTX.fillRect(0, 0, CANVAS_W, CANVAS_H);
    requestId = requestAnimationFrame(animate);

    Enemies.forEach((enemy, index) => {
        if (collision(enemy)) {
            setTimeout(() => {
                switch (enemy.color) {
                    case "#fff":
                        enemy.color = "blue";
                        break;
                    case "blue":
                        enemy.color = "red";
                        break;
                    case "red":
                        Enemies.splice(index, 1);
                }
            }, 0);
        }
        enemy.update();
    });

    if (ball.y > CANVAS_H || Enemies.length < 1) {
        cancelAnimationFrame(requestId);
        START_GAME.style.display = "block";
        if (ball.y > CANVAS_H) {
            status.innerText = "You Lose.";
        } else {
            status.innerText = "You Win!";
        }
    }

    if (player == "bot") {
        bot();
    }

    // boot track posistion of ball and move pipe

    ball.update();
    pipe.update();
}

function collision(rect) {
    distX = Math.abs(ball.x - rect.x - rect.w / 2);
    distY = Math.abs(ball.y - rect.y - rect.h / 2);

    if (distX > rect.w / 2 + ball.raduis || distY > rect.h / 2 + ball.raduis) {
        return false;
    }

    if (distX <= rect.w / 2 || distY <= rect.h / 2) {
        return true;
    }

    const dx = distX - rect.w / 2;
    const dy = distY - rect.h / 2;

    return dx * dx + dy * dy <= ball.raduis * ball.raduis;
}

function createEnemies() {
    Enemies = [];
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 6; x++) {
            Enemies.push(new Enemy(x * 60 + 15, y * 25 + 15, 50, 15, "#fff"));
        }
    }
}

function bot() {
    if (ball.y >= 150 && vel.y < 0) {
        if (pipe.x + 30 - ball.x < -7 && pipe.x + pipe.w < CANVAS_W) {
            pipe.x += 7;
        }
        if (pipe.x + 30 - ball.x > 7 && pipe.x > 0) {
            pipe.x -= 7;
        }
    }

    if (vel.y > 0) {
        if (pipe.x + 30 > CANVAS_W / 2) {
            pipe.x -= 5;
        }
        if (pipe.x + 30 < CANVAS_W / 2) {
            pipe.x += 5;
        }
    }
}

START_GAME.addEventListener("click", (e) => {
    player = (e.target.id == "bot" ? "bot" : "player");

    START_GAME.style.display = "none";

    ball.x = CANVAS_W / 2;
    ball.y = 354;
    pipe.x = CANVAS_W / 2 - 30;
    pipe.y = 364;

    createEnemies();
    animate();
});

function addListenerMulti(element, eventNames, listener) {
    eventNames.split(" ").forEach((event) => {
        element.addEventListener(event, listener, false);
    });
}

addListenerMulti(document, "touchstart mousedown keydown", (e) => {
    if (e.target == LEFT || e.keyCode == "37") {
        leftDir = true;
    } else if (e.target == RIGHT || e.keyCode == "39") {
        rightDir = true;
    }
});

addListenerMulti(document, "touchend mouseup keyup", () => {
    leftDir = rightDir = false;
});

createEnemies();
