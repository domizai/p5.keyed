const grid = 20;

let smooth;
let snapped;
let snappedX;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(3);
    textFont('monospace');
    textSize(14);
    rectMode(CENTER);

    smooth = motion();

    // GridSnap(size) rounds x and y to multiples of size,
    // so the motion jumps from cell to cell.
    snapped = motion().addEffect(new GridSnap(grid));

    // GridSnap(sizeX, sizeY) uses a size per axis; 0 leaves that axis alone.
    // This one steps sideways but moves smoothly up and down.
    snappedX = motion().addEffect(new GridSnap(grid, 0));
}

function motion() {
    return Keyed.ofVector()
        .key(Key.at(0).setEasing(1 / 3), createVector(80, 300))
        .key(Key.at(1).setEasing(1 / 3), createVector(200, 80))
        .key(Key.at(2).setEasing(1 / 3), createVector(320, 300))
        .key(Key.at(3).setEasing(1 / 3), createVector(80, 300));
}

function draw() {
    background(255);

    // Grid lines between the snapped positions, so each one is a cell.
    stroke(240);
    for (let i = grid / 2; i < width; i += grid) {
        line(i, 0, i, height);
        line(0, i, width, i);
    }

    noStroke();
    const s = snapped.value();
    fill(0);
    rect(s.x, s.y, grid, grid);

    const x = snappedX.value();
    fill(230, 60, 60);
    circle(x.x, x.y, grid * 0.8);

    const p = smooth.value();
    noFill();
    stroke(150);
    circle(p.x, p.y, grid);

    noStroke();
    fill(150);
    text('no effect', 20, 345);
    fill(0);
    text('new GridSnap(grid)', 20, 365);
    fill(230, 60, 60);
    text('new GridSnap(grid, 0)', 20, 385);
}
