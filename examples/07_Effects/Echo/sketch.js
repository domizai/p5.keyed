let pos;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(3);

    pos = Keyed.ofVector()
        .key(0, createVector(80, 300))
        .key(1, createVector(200, 80))
        .key(2, createVector(320, 300))
        .key(3, createVector(80, 300));
}

function draw() {
    background(255);

    // echo(samples, delay) returns the value now, delay seconds ago,
    // 2 * delay seconds ago, and so on: a ready-made motion trail.
    // A negative delay samples the future instead.
    const trail = pos.echo(12, 0.04);

    // Oldest first, so the current position is drawn on top.
    noStroke();
    for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i];
        fill(0, map(i, 0, trail.length, 255, 20));
        circle(p.x, p.y, 40 - i * 2);
    }
}
