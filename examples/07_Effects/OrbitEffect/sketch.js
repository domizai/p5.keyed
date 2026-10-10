let center;
let ball;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);

    center = motion();

    // Orbit(radius, frequency) circles around the value, frequency times
    // per second. 2 per second in a 4 second loop is a whole number of
    // circles, so the loop is seamless.
    // Orbit(radius, frequency, axis) circles around any 3D axis instead.
    ball = motion().addEffect(new Orbit(30, 2));
}

function motion() {
    return Keyed.ofVector()
        .key(Key.at(0).setEasing(1 / 3), createVector(100, 200))
        .key(Key.at(2).setEasing(1 / 3), createVector(300, 200))
        .key(Key.at(4).setEasing(1 / 3), createVector(100, 200));
}

function draw() {
    background(255);

    // Where the ball has been, from echo().
    const trail = ball.echo(60, 0.015);
    noStroke();
    for (let i = trail.length - 1; i > 0; i--) {
        const p = trail[i];
        fill(0, map(i, 0, trail.length, 120, 0));
        circle(p.x, p.y, 6);
    }

    // The value without the orbit.
    const c = center.value();
    const p = ball.value();
    stroke(220);
    line(c.x, c.y, p.x, p.y);
    noStroke();
    fill(200);
    circle(c.x, c.y, 8);

    fill(0);
    circle(p.x, p.y, 24);
}
