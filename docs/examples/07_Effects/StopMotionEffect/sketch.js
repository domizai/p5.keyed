let smooth;
let onTwos;
let choppy;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(2);
    textFont('monospace');
    textSize(14);

    smooth = sweep();

    // StopMotion(step) holds each pose for step seconds, whatever the keys.
    // 2 / 24 is "on twos" at 24 fps, common in hand-drawn animation.
    onTwos = sweep().addEffect(new StopMotion(2 / 24));
    choppy = sweep().addEffect(new StopMotion(0.25));

    // Unlike Key.hold(), which holds single keys,
    // StopMotion samples the whole animation at a fixed rate.
}

function sweep() {
    return Keyed.ofFloat()
        .key(Key.at(0).setEasing(1 / 3), 80)
        .key(Key.at(1).setEasing(1 / 3), 320)
        .key(Key.at(2).setEasing(1 / 3), 80);
}

function draw() {
    background(255);
    lane('no effect', 90, smooth);
    lane('StopMotion(2f / 24)', 210, onTwos);
    lane('StopMotion(0.25f)', 330, choppy);
}

function lane(label, y, x) {
    noStroke();
    fill(150);
    text(label, 40, y - 30);

    stroke(220);
    line(80, y, 320, y);

    noStroke();
    fill(0);
    circle(x.value(), y, 24);
}
