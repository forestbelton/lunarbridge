export class DisjointSet<A> {
  parent: DisjointSet<A>;
  size: number;
  value: A;

  constructor(value: A) {
    this.parent = this;
    this.size = 1;
    this.value = value;
  }

  find(): DisjointSet<A> {
    let root: DisjointSet<A> = this;
    while (root.parent !== root) {
      root = root.parent;
    }

    let node: DisjointSet<A> = this;
    while (node.parent !== root) {
      const parent = node.parent;
      node.parent = root;
      node = parent;
    }

    return root;
  }

  union(other: DisjointSet<A>) {
    const thisRoot = this.find();
    const otherRoot = other.find();

    if (thisRoot === otherRoot) {
      return;
    }

    if (thisRoot.size < otherRoot.size) {
      thisRoot.parent = otherRoot;
      otherRoot.size += thisRoot.size;
    } else {
      otherRoot.parent = thisRoot;
      thisRoot.size += otherRoot.size;
    }
  }
}

export class Partition<A> {
  entries: Map<A, DisjointSet<A>>;

  constructor() {
    this.entries = new Map();
  }

  create(x: A): DisjointSet<A> {
    let set = this.entries.get(x);
    if (typeof set === "undefined") {
      set = new DisjointSet(x);
      this.entries.set(x, set);
    }
    return set;
  }
}
