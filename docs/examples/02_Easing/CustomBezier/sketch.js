let x0 = 100;
let x1 = 340;

let names = [
    'cubicBezier(0.25, 0.1, 0.25, 1)',
    'cubicBezier(0.34, 1.56, 0.64, 1)',
    'cubicBezier(0.36, 0, 0.66, -0.56)',
    'quadraticBezier(0, 1.4, 1)',
    'smoothstep(0.3, 0.7)',
    'steps(4)',
    'd => ... (bounce)',
];
let easings;

let lanes = [];

function setup() {
    createCanvas(400, 400);

    Keyed.init().setDuration(3);
    textFont('monospace');
    textSize(14);
    textAlign(LEFT, CENTER);

    easings = [
        // Same as CSS cubic-bezier(); this one is CSS "ease".
        Easing.cubicBezier(0.25, 0.1, 0.25, 1),
        // y values above 1 overshoot the target...
        Easing.cubicBezier(0.34, 1.56, 0.64, 1),
        // ...and below 0 pull back before moving.
        Easing.cubicBezier(0.36, 0, 0.66, -0.56),
        // Starts at 0, ends at 1, pulled towards the middle value.
        Easing.quadraticBezier(0, 1.4, 1),
        // Waits until 0.3, moves smoothly, arrives at 0.7.
        Easing.smoothstep(0.3, 0.7),
        // Jumps in 4 equal steps, like CSS steps().
        Easing.steps(4),
        // Easing is a function, so any function of d works.
        // This one hits the target, bounces back twice and settles.
        (d) => 1 - abs(cos(d * 2.5 * PI)) * (1 - d),
    ];

    for (const e of easings) {
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
        const y = 45 + i * 52;
        graph(easings[i], 30, y);
        lane(names[i], y, lanes[i]);
    }
}

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
