let gentle;
let jittery;
let vertical;

function setup() {
    createCanvas(400, 400);
    // No duration: the default timeline runs forever, and so does the wiggle.
    Keyed.init();
    textFont('monospace');
    textSize(14);
    textAlign(LEFT, CENTER);

    // Effects change the value on top of the keys. Without any keys
    // the value is just the default, and the effect still moves it.

    // Wiggle(amplitude, frequency): a smooth random offset of up to
    // ±amplitude, changing direction about frequency times per second.
    gentle = Keyed.ofVector(createVector(300, 80))
        .addEffect(new Wiggle(10, 1));

    jittery = Keyed.ofVector(createVector(300, 200))
        .addEffect(new Wiggle(30, 3));

    // An amplitude per axis: this one only moves up and down.
    vertical = Keyed.ofVector(createVector(300, 320))
        .addEffect(new Wiggle(createVector(0, 30), 2));

    // Every Wiggle moves differently. Pass a seed as a third argument,
    // and Wiggles with the same seed and settings move the same way.
    // On a looping timeline, Wiggle loops seamlessly when
    // duration * frequency is a whole number.
}

function draw() {
    background(255);
    row('Wiggle(10, 1)', 80, gentle);
    row('Wiggle(30, 3)', 200, jittery);
    row('Wiggle(createVector(0, 30), 2)', 320, vertical);
}

function row(label, y, ball) {
    noStroke();
    fill(150);
    text(label, 20, y);

    // The value without the wiggle.
    fill(220);
    circle(300, y, 8);

    const p = ball.value();
    fill(0);
    circle(p.x, p.y, 24);
}
