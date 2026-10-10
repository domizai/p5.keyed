import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// P5_ENTRY=node_modules/p5/lib/p5.esm.js runs the tests against p5's bundled ES module, which loads in every p5 2.x version
// (the package entry of some versions can't be imported by Node), e.g. to test other p5 versions: see scripts/test-p5-versions.sh.
export default defineConfig({
    resolve: { alias: process.env.P5_ENTRY ? { p5: resolve(process.env.P5_ENTRY) } : {} },
});
