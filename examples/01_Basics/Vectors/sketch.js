// An animated p5.Vector blends x, y and z together.
let pos;
let corners;

function setup() {
    createCanvas(400, 400);

    Keyed.init().setDuration(4);

    corners = [
        createVector(100, 100),
        createVector(300, 100),
        createVector(300, 300),
        createVector(100, 300),
    ];

    pos = Keyed.ofVector();
    // One corner per second. The last key returns to the first corner,
    // so the loop closes without a jump.
    for (let i = 0; i <= corners.length; i++) {
        pos.key(i, corners[i % corners.length]);
    }
    // Keys store a copy, so changing corners now would not move them.
}

function draw() {
    background(255);
    noStroke();

    fill(200);
    for (const c of corners) {
        circle(c.x, c.y, 10);
    }

    const p = pos.value();
    fill(0);
    circle(p.x, p.y, 40);
}
