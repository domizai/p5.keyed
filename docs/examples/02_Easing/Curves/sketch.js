// An Easing is a function from linear progress to eased progress, both from 0 to 1.
// Here every curve is plotted, and a ball follows it. Keys will use the same functions.
let tm;
let curves;

const rowH = 58;
const graphX = 20;
const graphSize = 40;
const trackX0 = 190;
const trackX1 = 440;

function setup() {
    createCanvas(480, 20 + 12 * rowH);
    textFont('monospace');

    // 2 s of motion, then 1 s of rest, so the end of each curve is visible.
    tm = new Timeline().setDuration(3);

    curves = [
        ['QUAD_IN_OUT', Easing.QUAD_IN_OUT],
        ['CUBIC_IN', Easing.CUBIC_IN],
        ['CUBIC_OUT', Easing.CUBIC_OUT],
        ['CUBIC_IN_OUT', Easing.CUBIC_IN_OUT],
        ['QUINT_IN_OUT', Easing.QUINT_IN_OUT],
        ['SMOOTHSTEP', Easing.SMOOTHSTEP],
        ['cubicBezier(0.25, 0.1, 0.25, 1)', Easing.cubicBezier(0.25, 0.1, 0.25, 1)],
        ['cubicBezier(0.34, 1.56, 0.64, 1)', Easing.cubicBezier(0.34, 1.56, 0.64, 1)],
        ['cubicBezier(0.36, 0, 0.66, -0.56)', Easing.cubicBezier(0.36, 0, 0.66, -0.56)],
        ['steps(4)', Easing.steps(4)],
        ['HOLD', Easing.HOLD],
        // Any function works.
        ['d => bounce', (d) => 1 - abs(cos(d * 2.5 * PI)) * (1 - d)],
    ].map(([name, f]) => ({ name, f, graph: sample(f) }));
}

function draw() {
    background(255);
    const d = constrain(tm.t() / 2, 0, 1);

    curves.forEach(({ name, f, graph }, i) => {
        const y = 20 + i * rowH;
        drawGraph(graph, y, d);

        noStroke();
        fill(150);
        textSize(10);
        textAlign(LEFT);
        text(name, trackX0 - 130, y + 6);

        const ty = y + graphSize / 2 + 6;
        stroke(225);
        line(trackX0, ty + 10, trackX1, ty + 10);
        noStroke();
        fill(0);
        circle(lerp(trackX0, trackX1, f(d)), ty + 10, 12);
    });
}

// Samples the curve to find the vertical range worth drawing, since some overshoot.
function sample(f) {
    const ys = Array.from({ length: 101 }, (_, i) => f(i / 100));
    return { ys, lo: min(0, ...ys), hi: max(1, ...ys) };
}

function drawGraph({ ys, lo, hi }, y, d) {
    const gy = (v) => y + graphSize - map(v, lo, hi, 0, graphSize);
    noFill();
    stroke(225);
    rect(graphX, y, graphSize, graphSize);
    stroke(0);
    beginShape();
    ys.forEach((v, i) => vertex(graphX + (i / 100) * graphSize, gy(v)));
    endShape();
    noStroke();
    fill(230, 60, 60);
    circle(graphX + d * graphSize, gy(ys[round(d * 100)]), 5);
}
