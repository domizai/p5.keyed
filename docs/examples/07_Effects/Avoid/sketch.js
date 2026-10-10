const points = 6;
const radius = 80;
const softness = 100;

let loop;
let spline;
let pos;
let obstacle;

function setup() {
    createCanvas(400, 400);
    Keyed.init().setDuration(4);
    textFont('monospace');
    textSize(14);

    // The same path on every run. Click for a new one.
    randomSeed(4);
    loop = createLoop(points);
    spline = new Spline(loop);

    pos = Keyed.ofVector()
        .key(0, spline)
        .key(4, spline);

    obstacle = createVector(width / 2, height / 2);
    pos.addEffect(avoid(obstacle, radius, softness));
}

// A custom effect that keeps the value out of a circle.
// Points inside are pushed onto its edge, so the motion walks around it.
// softness rounds off the corners where the path meets the circle.
function avoid(center, r, soft) {
    return (source, t) => {
        const p = source(t);
        const away = p5.Vector.sub(p, center);
        const d = away.mag();
        if (d >= r + soft || d === 0) return p;

        // A smooth max(d, r): the distance never drops below r,
        // and blends in over the softness band around the edge.
        const h = max(soft - abs(d - r), 0) / soft;
        const target = max(d, r) + h * h * soft / 4;
        return p5.Vector.add(center, away.setMag(target));
    };
}

// Random points, wrapped around like in SplinePath to close the loop.
function createLoop(n) {
    const margin = 50;
    const pts = [];
    for (let i = 0; i < n; i++) {
        pts.push(createVector(random(margin, width - margin), random(margin, height - margin)));
    }
    return [pts[n - 1], ...pts, pts[0], pts[1]];
}

function mousePressed() {
    loop = createLoop(points);
    spline.setPoints(loop);
}

function draw() {
    background(255);

    // The path without the effect.
    noFill();
    stroke(220);
    strokeWeight(2);
    beginShape();
    for (let i = 0; i <= 300; i++) {
        const p = spline.value(i / 300);
        vertex(p.x, p.y);
    }
    endShape();

    stroke(255, 0, 0);
    circle(obstacle.x, obstacle.y, radius * 2);

    // The motion with the effect, as a trail.
    const trail = pos.echo(200, 0.003);
    noFill();
    stroke(0);
    strokeWeight(5);
    beginShape();
    for (const p of trail) {
        vertex(p.x, p.y);
    }
    endShape();

    noStroke();
    fill(150);
    text('click for a new path', 40, 380);
}
