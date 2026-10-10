let plain;
let stiff;
let wobbly;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);

    plain = jump();

    // Spring(lerp, frequency, damping) follows the value like a spring:
    // it lags behind, overshoots and settles. frequency is in wobbles per
    // second; damping goes from 0 (wobbles forever) to 1 (no wobble).
    stiff = jump().addEffect(new Spring(new FloatLerp(), 4, 0.6));
    wobbly = jump().addEffect(new Spring(new FloatLerp(), 2, 0.4));

    // For p5.Vectors there is a shortcut: Effect.spring(2, 0.4).
}

// Jumps right at 0.5 seconds and back at 2.5, with no motion in between.
function jump() {
    return Keyed.ofFloat()
        .key(Key.at(0).hold(), 100)
        .key(Key.at(0.5).hold(), 300)
        .key(2.5, 100);
}

function draw() {
    background(255);
    lane('hold()', 90, plain);
    lane('Spring(4, 0.6)', 210, stiff);
    lane('Spring(2, 0.4)', 330, wobbly);
}

function lane(label, y, x) {
    noStroke();
    fill(150);
    text(label, 40, y - 30);

    stroke(220);
    line(100, y, 300, y);

    noStroke();
    fill(0);
    circle(x.value(), y, 24);
}
