// A reusable animation: extend Composition and create its values with add().
// Constructor parameters make every instance a little different.
class Burst extends Composition {
    // size scales the burst, col colors its dots, and duration is how long it plays.
    constructor(x, y, size, col, duration) {
        // A timeline of its own that plays once.
        super(duration);
        this.x = x;
        this.y = y;
        this.col = col;

        // add() puts a value on this composition's timeline.
        // Key times are local: 0 is when this burst was created.
        // Here they are fractions of the duration, so the timing stretches with it.
        const d = duration;

        this.ring = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.CUBIC_OUT), 0)
            .key(d, 90 * size));

        this.fade = this.add(Keyed.ofFloat()
            .key(0.4 * d, 255)
            .key(d, 0));

        this.spread = this.add(Keyed.ofFloat()
            .key(Key.at(0).setEasing(Easing.QUART_OUT), 0)
            .key(d, 60 * size));

        this.dotSize = this.add(Keyed.ofFloat()
            .key(0, 14 * size)
            .key(d, 0));
    }

    draw() {
        noFill();
        stroke(0, this.fade.value());
        strokeWeight(4);
        circle(this.x, this.y, this.ring.value() * 2);
        strokeWeight(1);

        noStroke();
        fill(this.col);
        for (let i = 0; i < 8; i++) {
            const a = (i * TWO_PI) / 8;
            const r = this.spread.value();
            circle(this.x + cos(a) * r, this.y + sin(a) * r, this.dotSize.value());
        }
    }
}
