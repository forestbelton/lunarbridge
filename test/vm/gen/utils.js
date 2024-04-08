import { expect } from "chai";
import {
  ConstantPool,
  TemporaryRegisterAllocator,
  T,
} from "../../../dist/vm/gen/utils.js";

describe("code generation utilities", () => {
  it("ConstantPool", () => {
    const pool = new ConstantPool();

    expect(pool.indexOf(1)).to.equal(0);
    expect(pool.constants).to.deep.equal([1]);

    expect(pool.indexOf(1)).to.equal(0);
    expect(pool.constants).to.deep.equal([1]);

    expect(pool.indexOf("2")).to.equal(1);
    expect(pool.constants).to.deep.equal([1, "2"]);

    expect(pool.indexOf("2")).to.equal(1);
    expect(pool.constants).to.deep.equal([1, "2"]);

    expect(pool.indexOf(1)).to.equal(0);
    expect(pool.constants).to.deep.equal([1, "2"]);
  });

  it("TemporaryRegisterAllocator", () => {
    const allocator = new TemporaryRegisterAllocator();

    expect(allocator.alloc()).to.deep.equal(T(0));
    expect(allocator.alloc()).to.deep.equal(T(1));
    expect(allocator.alloc()).to.deep.equal(T(2));

    const allocator1 = new TemporaryRegisterAllocator(10);

    expect(allocator1.alloc()).to.deep.equal(T(10));
    expect(allocator1.alloc()).to.deep.equal(T(11));
    expect(allocator1.alloc()).to.deep.equal(T(12));
  });
});
