let tm;

function setup() {
    createCanvas(800, 600);
    textSize(24);

    tm = new Timeline().setDuration(2);
}

function draw() {
    background(220);
    text(`t = ${tm.t().toFixed(2)}`, 20, 40);
}
