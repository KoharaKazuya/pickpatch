import pickpatch from "./pickpatch";

describe("pickpatch", () => {
  it("updates any partial of any data", () => {
    const dataset: Array<
      [any, (...args: any[]) => any, (...args: any[]) => any, any]
    > = [
      [1, _ => _, x => x + 1, 2],
      [1, _ => null, x => 2, 1],
      [{ a: { b: 1 }, c: 2 }, x => x.a.b, v => v * 10, { a: { b: 10 }, c: 2 }],
      [
        { a: { b: 1 }, c: 2 },
        x => [x.a.b, x.c],
        ([b, c]) => [b * 2, c * 3],
        { a: { b: 2 }, c: 6 },
      ],
      [
        { a: { b: 1 }, c: 2 },
        x => ({ d: x.a.b, e: [x.c] }),
        ({ d, e }) => ({ d: d + 1, e: [(d + 10) * e[0]] }),
        { a: { b: 2 }, c: 22 },
      ],
    ];

    for (const d of dataset) {
      expect(pickpatch(d[1])(d[2])(d[0])).toEqual(d[3]);
    }
  });

  it("does not update base object (immutability)", () => {
    const nested = { b: 1 };
    const base = { a: nested, c: 2 };
    const _ = pickpatch((x: any) => [x.a.b, x.c])(([b, c]) => [b + 1, c + 1])(
      base,
    );

    expect(base).toEqual({ a: { b: 1 }, c: 2 });
    expect(base.a).toBe(nested);
  });

  it("returns the same object unless any update", () => {
    const base = { a: 1 };
    expect(pickpatch(_ => null)(_ => null)(base)).toBe(base);

    const tree = { a: { b: 2 }, c: { d: 3 } };
    const updated = pickpatch((x: any) => x.a.b)(v => v * 2)(tree);
    expect(updated.a).not.toBe(tree.a);
    expect(updated.c).toBe(tree.c);
  });
});
