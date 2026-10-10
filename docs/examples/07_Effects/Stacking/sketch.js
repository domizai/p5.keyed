const grid = 20;

let snapLast;
let snapFirst;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);
    rectMode(CENTER);

    // addEffect() can be called several times. Effects apply in the order
    // they are added, each one to the result of the one before.

    // Orbit, then GridSnap: the whole circle snaps to the grid.
    snapLast = motion(130)
        .addEffect(new Orbit(40, 1))
        .addEffect(new GridSnap(grid));

    // GridSnap, then Orbit: only the center snaps, the circle stays smooth.
    snapFirst = motion(290)
        .addEffect(new GridSnap(grid))
        .addEffect(new Orbit(40, 1));
}

function motion(y) {
    return Keyed.ofVector()
        .key(Key.at(0).setEasing(1 / 3), createVector(100, y))
        .key(Key.at(2).setEasing(1 / 3), createVector(300, y))
        .key(Key.at(4).setEasing(1 / 3), createVector(100, y));
}

function draw() {
    background(255);

    stroke(240);
    for (let i = grid / 2; i < width; i += grid) {
        line(i, 0, i, height);
        line(0, i, width, i);
    }

    noStroke();
    const a = snapLast.value();
    fill(0);
    rect(a.x, a.y, grid, grid);

    const b = snapFirst.value();
    fill(230, 60, 60);
    circle(b.x, b.y, grid);

    fill(0);
    text('Orbit, then GridSnap', 40, 60);
    fill(230, 60, 60);
    text('GridSnap, then Orbit', 40, 220);
}
