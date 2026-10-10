#!/bin/sh
# Runs the unit tests against other versions of p5 (installed temporarily, package.json is not changed).
# Usage: scripts/test-p5-versions.sh [version ...]   default: every 2.x release from 2.0.0
set -e
cd "$(dirname "$0")/.."

versions="$*"
if [ -z "$versions" ]; then
    versions=$(npm view p5 versions --json | tr -d ' \n[]"' | tr ',' '\n' | grep '^2\.[0-9]*\.[0-9]*$')
fi

status=0
for v in $versions; do
    npm install "p5@$v" --no-save --force --ignore-scripts --no-audit --no-fund >/dev/null 2>&1
    # p5's bundled ES module loads in Node and happy-dom for every 2.x version, its package entry doesn't.
    result=$(P5_ENTRY=node_modules/p5/lib/p5.esm.js npx vitest run 2>&1 | grep -E '^ +Tests ' | sed 's/^ *Tests *//') || true
    echo "p5 $v: $result"
    case "$result" in *failed*|"") status=1 ;; esac
done

npm install p5@"$(node -p "require('./package.json').devDependencies.p5.replace(/^[^0-9]*/, '')")" --no-save --force --ignore-scripts --no-audit --no-fund >/dev/null 2>&1
echo "restored p5 $(node -p "require('./node_modules/p5/package.json').version")"
exit $status
