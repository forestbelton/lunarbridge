export class Block {
  constructor(statements, returnExprs) {
    this.statements = statements;
    this.returnExprs = returnExprs;
  }
}

export class AssignStatement {
  constructor(vars, exprs) {
    this.vars = vars;
    this.exprs = exprs;
  }
}

export class LabelStatement {
  constructor(label) {
    this.label = label;
  }
}

export class BreakStatement {
  constructor() {}
}

export class GotoStatement {
  constructor(label) {
    this.label = label;
  }
}

export class DoStatement {
  constructor(body) {
    this.body = body;
  }
}

export class WhileStatement {
  constructor(cond, body) {
    this.cond = cond;
    this.body = body;
  }
}

export class RepeatStatement {
  constructor(cond, body) {
    this.cond = cond;
    this.body = body;
  }
}

export class IfElseStatement {
  constructor(ifBodies, elseBody) {
    this.ifBodies = ifBodies;
    this.elseBody = elseBody;
  }
}

export class ForRangeStatement {
  constructor(name, start, end, step, body) {
    this.name = name;
    this.start = start;
    this.end = end;
    this.step = step;
    this.body = body;
  }
}

export class ForInStatement {
  constructor(names, exprs, body) {
    this.names = names;
    this.exprs = exprs;
    this.body = body;
  }
}

export class FunctionStatement {
  constructor(name, local, func) {
    this.name = name;
    this.local = local;
    this.func = func;
  }
}

export class DeclareStatement {
  constructor(names, exprs) {
    this.names = names;
    this.exprs = exprs;
  }
}

export class CallStatement {
  constructor(call) {
    this.call = call;
  }
}

export const ELLIPSIS = "...";

export class Identifier {
  constructor(name) {
    this.name = name;
  }
}

export class UnaryOpExpr {
  constructor(op, expr) {
    this.op = op;
    this.expr = expr;
  }
}

export class BinOpExpr {
  constructor(op, left, right) {
    this.op = op;
    this.left = left;
    this.right = right;
  }
}

export class ConstantExpr {
  constructor(value) {
    this.value = value;
  }
}

export const NIL = new ConstantExpr(null);

export const TRUE = new ConstantExpr(true);

export const FALSE = new ConstantExpr(false);

export class FunctionExpr {
  constructor(params, body) {
    this.params = params;
    this.body = body;
  }
}

export class TableExpr {
  constructor(fields) {
    this.fields = fields;
  }
}

export class IndexExpr {
  constructor(key, target) {
    this.key = key;
    this.target = target;
  }
}

export class CallExpr {
  constructor(target, args, method) {
    this.target = target;
    this.args = args;
    this.method = method;
  }
}
