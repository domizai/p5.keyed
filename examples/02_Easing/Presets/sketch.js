let x0 = 100;
let x1 = 340;

// There are IN, OUT and IN_OUT presets for QUAD, CUBIC, QUART and QUINT,
// plus SMOOTHSTEP and HOLD.
let names = [
    'CUBIC_IN',
    'CUBIC_OUT',
    'CUBIC_IN_OUT',
    'QUAD_IN_OUT',
    'QUINT_IN_OUT',
    'SMOOTHSTEP',
];

let easings = [
    Easing.CUBIC_IN,
    Easing.CUBIC_OUT,
    Easing.CUBIC_IN_OUT,
    Easing.QUAD_IN_OUT,
    Easing.QUINT_IN_OUT,
    Easing.SMOOTHSTEP,
];

let lanes = [];

function setup() {
    createCanvas(400, 400);

    Keyed.init().setDuration(3);
    textFont('monospace');
    textSize(14);
    textAlign(LEFT, CENTER);

    for (const e of easings) {
        // An Easing shapes the whole segment from its key to the next one,
        // so the last key doesn't need one.
        lanes.push(
            Keyed.ofFloat()
                .key(Key.at(0).setEasing(e), x0)
                .key(Key.at(1.5).setEasing(e), x1)
                .key(3, x0),
        );
    }
}

function draw() {
    background(255);
    for (let i = 0; i < lanes.length; i++) {
        const y = 60 + i * 56;
        graph(easings[i], 30, y);
        lane(names[i], y, lanes[i]);
    }
}

// An Easing is a function from linear progress to eased progress, both 0..1.
function graph(e, x, y) {
    const s = 36;
    noFill();
    stroke(220);
    rect(x, y - s / 2, s, s);
    stroke(0);
    beginShape();
    for (let i = 0; i <= 40; i++) {
        const d = i / 40;
        vertex(x + d * s, y + s / 2 - e(d) * s);
    }
    endShape();
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
