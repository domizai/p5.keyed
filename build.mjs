import { readFileSync } from 'node:fs';
import { build, context } from 'esbuild';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} | ${pkg.homepage} */`;
const watch = process.argv.includes('--watch');

const common = {
    bundle: true,
    target: 'es2020',
    banner: { js: banner },
};

// A script tag file that sets up globals and registers itself, its minified twin, and an ES module without side effects.
const outputs = [
    { ...common, entryPoints: ['src/script.ts'], format: 'iife', globalName: 'p5keyed', outfile: 'lib/p5.keyed.js' },
    { ...common, entryPoints: ['src/script.ts'], format: 'iife', globalName: 'p5keyed', minify: true, outfile: 'lib/p5.keyed.min.js' },
    { ...common, entryPoints: ['src/p5.keyed.ts'], format: 'esm', outfile: 'lib/p5.keyed.esm.js' },
];

if (watch) {
    // Only the script tag file is rebuilt while developing.
    const ctx = await context(outputs[0]);
    await ctx.watch();
} else {
    await Promise.all(outputs.map((options) => build(options)));
}
