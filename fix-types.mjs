// tsc leaves relative imports in the .d.ts files without extensions, which TypeScript's node16 / nodenext
// module resolution rejects. This adds them, so the types work for every kind of project.
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = new URL('./lib/types', import.meta.url).pathname;

function* declarations(dir) {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) yield* declarations(path);
        else if (name.endsWith('.d.ts')) yield path;
    }
}

let fixed = 0;
for (const file of declarations(root)) {
    const source = readFileSync(file, 'utf8');
    const result = source.replace(/(from\s+|import\()'(\.{1,2}\/[^']*)'/g, (match, prefix, specifier) => {
        const target = join(dirname(file), specifier);
        if (existsSync(`${target}.d.ts`)) return `${prefix}'${specifier}.js'`;
        if (existsSync(join(target, 'index.d.ts'))) return `${prefix}'${specifier}/index.js'`;
        throw new Error(`${file}: can't resolve '${specifier}'`);
    });
    if (result !== source) {
        writeFileSync(file, result);
        fixed++;
    }
}
console.log(`fix-types: ${fixed} declaration files updated`);
