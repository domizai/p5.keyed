let plain;
let bobbing;
let delayed;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(3);
    textFont('monospace');
    textSize(14);

    plain = sweep(90);

    // In JS, custom effects always get source(t) and the time.
    // This one bobs up and down twice per second.
    const bob = (source, t) => {
        const p = source(t);
        return createVector(p.x, p.y + 15 * sin(t * TWO_PI * 2));
    };
    bobbing = sweep(210).addEffect(bob);

    // This one plays the animation half a second late.
    const late = (source, t) => source(t - 0.5);
    delayed = sweep(330).addEffect(late);
}

function sweep(y) {
    return Keyed.ofVector()
        .key(Key.at(0).setEasing(1 / 3), createVector(80, y))
        .key(Key.at(1.5).setEasing(1 / 3), createVector(320, y))
        .key(Key.at(3).setEasing(1 / 3), createVector(80, y));
}

function draw() {
    background(255);
    lane('no effect', 90, plain);
    lane('Effect      (p, t) -> ...', 210, bobbing);
    lane('TimeEffect  (source, t) -> ...', 330, delayed);
}

function lane(label, y, ball) {
    noStroke();
    fill(150);
    text(label, 40, y - 40);

    stroke(220);
    line(80, y, 320, y);

    const p = ball.value();
    noStroke();
    fill(0);
    circle(p.x, p.y, 24);
}
