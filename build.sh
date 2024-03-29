#!/bin/bash
set -euo pipefail

rm -rf build
tsc
rsync -qavum --include='*.js' --include='*/' --exclude='*' ./lib/ ./build
peggy --allowed-start-rules '*' -o build/parser/parser.js --format es lib/parser/lua.peggy
