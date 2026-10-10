let tm;
let hit;
let x;

let leftFlash = 0;
let rightFlash = 0;
let last = '';

const barX0 = 40;
const barX1 = 360;
const barY = 300;

function setup() {
    createCanvas(400, 400);
    tm = Keyed.init().setDuration(3);
    textFont('monospace');
    textAlign(CENTER, CENTER);

    hit = Pin.at(1.5);

    x = Keyed.ofFloat()
        .key(0, 50)
        .key(hit, 350)
        .key(3, 50);

    // A marker calls back whenever playback crosses its time.
    tm.addMarker('left', 0, (m) => fired(m));
    // On the key's pin, it fires exactly when the ball arrives,
    // even after the pin is moved.
    tm.addMarker('right', hit, (m) => fired(m));
}

function fired(m) {
    if (m.name() === 'left') {
        leftFlash = 255;
    } else {
        rightFlash = 255;
    }
    last = `${m.name()} at ${nf(m.t(), 1, 2)}`;
}

function draw() {
    background(255);

    if (mouseIsPressed) {
        // to(t, true) fires the markers passed on the way, in either direction.
        // A plain to(t) jumps silently.
        const t = map(constrain(mouseX, barX0, barX1), barX0, barX1, 0, tm.duration());
        tm.to(t, true);
    }

    // Walls that flash when their marker fires.
    noStroke();
    fill(230, 60, 60, leftFlash);
    rect(20, 60, 10, 160);
    fill(230, 60, 60, rightFlash);
    rect(370, 60, 10, 160);
    leftFlash *= 0.9;
    rightFlash *= 0.9;

    fill(0);
    circle(x.value(), 140, 40);

    // The bar, with every marker and the playhead.
    stroke(220);
    line(barX0, barY, barX1, barY);
    for (const m of tm.markers()) {
        const mx = map(m.t(), 0, tm.duration(), barX0, barX1);
        noStroke();
        fill(230, 60, 60);
        triangle(mx - 6, barY - 16, mx + 6, barY - 16, mx, barY - 6);
        fill(150);
        text(m.name(), mx, barY - 30);
    }
    stroke(0);
    const head = map(tm.t(), 0, tm.duration(), barX0, barX1);
    line(head, barY - 10, head, barY + 10);

    noStroke();
    fill(0);
    text(last, width / 2, 250);
    fill(150);
    text('drag to scrub   M toggle right', width / 2, barY + 40);
}

function mousePressed() {
    tm.play(false);
}

function mouseReleased() {
    tm.play(true);
}

function keyPressed() {
    if (key.toLowerCase() === 'm') {
        // Markers can be looked up by name, removed and added again.
        const m = tm.marker('right');
        if (m !== null) {
            tm.removeMarker(m);
        } else {
            tm.addMarker('right', hit, (marker) => fired(marker));
        }
    }
}
