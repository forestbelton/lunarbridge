import util from "util";
import { parse } from "./lib/parser/index.js";

const result = parse(`tbl = {
    x = 1,
    [y] = 2,
    3,
}`);

console.log(util.inspect(result, { depth: null }));
