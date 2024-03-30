import type { Block, Expr } from "./ast.js";

export function parse(s: string, options: { startRule: "expr" }): Expr;
export function parse(s: string, options?: any): Block;
