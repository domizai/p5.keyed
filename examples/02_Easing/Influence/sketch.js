let x0 = 40;
let x1 = 360;

let linear;
let easy;
let strong;
let easeOut;
let easeIn;

function setup() {
    createCanvas(400, 400);

    Keyed.init().setDuration(3);
    textFont('monospace');
    textSize(14);
    textAlign(LEFT, CENTER);

    // Without easing the speed is constant and stops are abrupt.
    linear = Keyed.ofFloat()
        .key(0, x0)
        .key(1.5, x1)
        .key(3, x0);

    // Influence in [0, 1] slows the motion near a key, like in After Effects.
    // 1/3 on both sides of a key is After Effects' Easy Ease.
    easy = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), x0)
        .key(Key.at(1.5).setEasing(1 / 3), x1)
        .key(Key.at(3).setEasing(1 / 3), x0);

    // More influence: slower near the keys, faster in between.
    strong = Keyed.ofFloat()
        .key(Key.at(0).setEasing(1), x0)
        .key(Key.at(1.5).setEasing(1), x1)
        .key(Key.at(3).setEasing(1), x0);

    // setEasingOut() only eases leaving a key: soft start, hard stop.
    easeOut = Keyed.ofFloat()
        .key(Key.at(0).setEasingOut(1), x0)
        .key(Key.at(1.5).setEasingOut(1), x1)
        .key(Key.at(3).setEasingOut(1), x0);

    // setEasingIn() only eases arriving at a key: hard start, soft stop.
    easeIn = Keyed.ofFloat()
        .key(Key.at(0).setEasingIn(1), x0)
        .key(Key.at(1.5).setEasingIn(1), x1)
        .key(Key.at(3).setEasingIn(1), x0);
}

function draw() {
    background(255);
    lane('linear', 70, linear);
    lane('setEasing(1 / 3f)', 135, easy);
    lane('setEasing(1)', 200, strong);
    lane('setEasingOut(1)', 265, easeOut);
    lane('setEasingIn(1)', 330, easeIn);
}

function lane(label, y, x) {
    noStroke();
    fill(150);
    text(label, x0, y - 20);

    stroke(220);
    line(x0, y, x1, y);

    noStroke();
    fill(0);
    circle(x.value(), y, 16);
}
