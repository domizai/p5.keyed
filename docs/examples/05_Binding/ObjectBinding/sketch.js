class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.col = color(0);
    }

    setColor(c) {
        this.col = c;
    }

    draw() {
        noStroke();
        fill(this.col);
        circle(this.x, this.y, 30);
    }
}

const balls = [];

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(2);

    for (let i = 0; i < 7; i++) {
        const b = new Ball(60 + i * 47, 300);
        balls.push(b);

        // Each ball starts a little later than the one before.
        const delay = i * 0.1;

        // Binds the y property of this ball, by name.
        Keyed.bind(b, 'y')
            .key(Key.at(delay).setEasing(1 / 3), 300)
            .key(Key.at(delay + 0.5).setEasing(1 / 3), 120)
            .key(Key.at(delay + 1).setEasing(1 / 3), 300);

        // Colors are objects, so a setter of the ball receives them.
        // (Binding the color by name works too: Keyed.bind(b, "col").)
        Keyed.bind(new ColorLerp(), color(0), (c) => b.setColor(c))
            .key(delay, color(0))
            .key(delay + 0.5, color(230, 60, 60))
            .key(delay + 1, color(0));
    }
}

function draw() {
    background(255);
    // The balls are already up to date; they just draw themselves.
    for (const b of balls) {
        b.draw();
    }
}
