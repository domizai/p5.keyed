// Live sketches: <div class="sketch" data-sketch="05_Binding/ObjectBinding"></div> shows examples/<path>/index.html.
// Add data-size="640" for a canvas that is not 400 px.
// A sketch only runs while it is on screen, and starts from the beginning each time it comes into view.
(function () {
    const base = new URL('../examples/', document.currentScript.src).href;

    function load(box) {
        const iframe = document.createElement('iframe');
        iframe.title = box.dataset.sketch;
        iframe.src = base + box.dataset.sketch + '/index.html';
        iframe.addEventListener('load', () => {
            try {
                const body = iframe.contentDocument.body;
                body.style.margin = '0';
                body.style.overflow = 'hidden';
            } catch (e) {
                // Opened from file://, where the frame can't be styled.
            }
        });
        box.prepend(iframe);
    }

    function unload(box) {
        box.querySelector('iframe')?.remove();
    }

    function setup(box) {
        // data-size is the canvas size in pixels, 400 unless the example says otherwise.
        const size = Number(box.dataset.size) || 400;
        box.style.setProperty('--sketch-size', size + 'px');
        const link = document.createElement('a');
        link.className = 'sketch-open';
        link.href = base + box.dataset.sketch + '/index.html';
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = 'open ↗';
        box.append(link);
        observer.observe(box);
        // On narrow screens the frame is scaled down to fit.
        new ResizeObserver(() => box.style.setProperty('--sketch-scale', Math.min(1, box.clientWidth / size))).observe(box);
    }

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const running = entry.target.querySelector('iframe');
            if (entry.isIntersecting && !running) load(entry.target);
            else if (!entry.isIntersecting && running) unload(entry.target);
        }
    }, { threshold: 0.2 });

    // Material swaps pages without reloading, so look for sketches on every page change.
    function scan() {
        document.querySelectorAll('.sketch[data-sketch]:not([data-ready])').forEach((box) => {
            box.dataset.ready = '1';
            setup(box);
        });
    }

    if (window.document$) window.document$.subscribe(scan);
    else document.addEventListener('DOMContentLoaded', scan);
})();
