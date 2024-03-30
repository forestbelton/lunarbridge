#!/bin/bash
set -euo pipefail

BUILD_DIR=./dist

rm -rf "$BUILD_DIR"
tsc
rsync -qavum --include='*.js' --include '*.d.ts' --include='*/' --exclude='*' ./lib/ "$BUILD_DIR"
peggy --allowed-start-rules '*' -o "$BUILD_DIR/parser/parser.js" --format es lib/parser/lua.peggy
