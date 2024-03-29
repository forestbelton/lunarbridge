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
  constructor(name, params, body, local) {
    this.name = name;
    this.params = params;
    this.body = body;
    this.local = local;
  }
}
