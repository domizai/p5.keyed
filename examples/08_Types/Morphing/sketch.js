let shape;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);

    // ShapeMorph is a closed polygon that blends point by point.
    // The shape with fewer points gets extra points on its longest edges,
    // so outlines and corners stay sharp while it morphs.
    shape = Keyed.of(polygon(3, 130))
        .key(Key.at(0).setEasing(0.6), polygon(3, 130))
        .key(Key.at(1).setEasing(0.6), polygon(4, 120))
        .key(Key.at(2).setEasing(0.6), star(5, 140, 60))
        .key(Key.at(3).setEasing(0.6), polygon(40, 120))
        .key(Key.at(4).setEasing(0.6), polygon(3, 130));
}

// All shapes start at the top, so they don't twist while morphing.
function polygon(n, r) {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = -HALF_PI + (i * TWO_PI) / n;
        pts.push(createVector(200 + cos(a) * r, 190 + sin(a) * r));
    }
    return new ShapeMorph(pts);
}

function star(n, outer, inner) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
        const a = -HALF_PI + (i * PI) / n;
        const r = i % 2 === 0 ? outer : inner;
        pts.push(createVector(200 + cos(a) * r, 190 + sin(a) * r));
    }
    return new ShapeMorph(pts);
}

function draw() {
    background(255);

    const s = shape.value();

    noStroke();
    fill(0);
    beginShape();
    s.vertices();
    endShape(CLOSE);

    // The points it is made of.
    fill(230, 60, 60);
    for (const p of s.points) {
        circle(p.x, p.y, 6);
    }

    fill(150);
    text(`${s.points.length} points`, 40, 380);
}
