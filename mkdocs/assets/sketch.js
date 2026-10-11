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
                // The canvas shrinks to fit the frame, so narrow screens see all of it.
                const style = iframe.contentDocument.createElement('style');
                style.textContent = 'html, body { margin: 0; overflow: hidden; }'
                    + ' canvas { display: block; width: 100% !important; height: auto !important; }';
                iframe.contentDocument.head.append(style);
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
