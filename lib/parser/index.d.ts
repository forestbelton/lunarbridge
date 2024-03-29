import type { Block, Expr } from "./ast.d.ts";

export function parse(s: string, options: { startRule: "expr" }): Expr;
export function parse(s: string, options?: any): Block;
