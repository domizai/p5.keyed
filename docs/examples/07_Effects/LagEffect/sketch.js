let corners;

let plain;
let shortLag;
let longLag;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);

    corners = [
        createVector(100, 80),
        createVector(300, 80),
        createVector(300, 280),
        createVector(100, 280),
    ];

    plain = squareMotion();

    // Lag averages the value over the last duration seconds: it trails
    // behind and rounds off sharp corners, without overshooting.
    // More samples is smoother, but each one costs an evaluation.
    shortLag = squareMotion().addEffect(Effect.lag(0.3, 10));
    longLag = squareMotion().addEffect(Effect.lag(1, 30));
}

// One corner per second, at constant speed.
function squareMotion() {
    const k = Keyed.ofVector();
    for (let i = 0; i <= corners.length; i++) {
        k.key(i, corners[i % corners.length]);
    }
    return k;
}

function draw() {
    background(255);

    noFill();
    stroke(230);
    rect(100, 80, 200, 200);

    noStroke();
    const p = plain.value();
    fill(200);
    circle(p.x, p.y, 12);

    const a = shortLag.value();
    fill(0);
    circle(a.x, a.y, 24);

    const b = longLag.value();
    fill(230, 60, 60);
    circle(b.x, b.y, 24);

    fill(200);
    text('no effect', 40, 340);
    fill(0);
    text('Effect.lag(0.3f, 10)', 40, 360);
    fill(230, 60, 60);
    text('Effect.lag(1, 30)', 40, 380);
}
