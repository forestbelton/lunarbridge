import { expect } from "chai";
import { registerList } from "../../dist/vm/func.js";

describe("registerList", () => {
  it("get", () => {
    const proxy = registerList([0, 1, 2, 3, 4], 2, 3);

    expect(proxy[0]).to.equal(2);
    expect(proxy[1]).to.equal(3);
    expect(proxy[2]).to.equal(4);

    expect(() => proxy[-1]).to.throw();
    expect(() => proxy[3]).to.throw();
  });

  it("set", () => {
    const stack = [0, 1, 2, 3, 4];
    const proxy = registerList(stack, 2, 3);

    proxy[0] = "a";
    expect(stack[2]).to.equal("a");
    expect(proxy[0]).to.equal("a");

    proxy[1] = "b";
    expect(stack[3]).to.equal("b");
    expect(proxy[1]).to.equal("b");

    proxy[2] = "c";
    expect(stack[4]).to.equal("c");
    expect(proxy[2]).to.equal("c");
  });

  it("length", () => {
    const proxy = registerList([0, 1, 2, 3, 4], 2, 3);
    expect(proxy.length).to.equal(3);
  });
});
