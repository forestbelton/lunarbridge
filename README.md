# lunarbridge

[![build status](https://github.com/forestbelton/lunarbridge/actions/workflows/build.yaml/badge.svg)](https://github.com/forestbelton/lunarbridge/actions/workflows/build.yaml) [![npm](https://img.shields.io/npm/v/lunarbridge?logo=npm)](https://www.npmjs.com/package/lunarbridge)

Lua 5.4 runtime for JavaScript

## Install

```
$ npm install lunarbridge
```

## Usage

```javascript
import { LuaRuntime } from "lunarbridge";

const runtime = new LuaRuntime();
runtime.executeScript(`
    function fib(n)
        a = 1
        b = 1
        for i = 1, n do
            t = a + b
            a = b
            b = t
        end
        return a
    end
`);

const result = runtime.execute("fib(10)");
console.log(result);
```

## Not implemented (yet!!)

- Metatables and metamethods
- Attributes (`<const>`, `<>`)
- Coroutines
- Goto
- The standard library
