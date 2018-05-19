import pickpatch from "./pickpatch";

describe("pickpatch", () => {
  it("picks any from nested object and patch", () => {
    const base = { a: { b: 1 }, c: 2 };
    const picker = (obj: any) => obj.a.b;
    const patcher = (v: number) => v * 10;
    const updated = pickpatch(picker)(patcher)(base);
    expect(updated).toEqual({ a: { b: 10 }, c: 2 });
  });

  it("can pick as array", () => {
    const base = { a: { b: 1 }, c: 2 };
    const picker = (obj: any) => [obj.a.b, obj.c] as [number, number];
    const patcher = ([v1, v2]: [number, number]) =>
      [v1 * 2, v2 * 3] as [number, number];
    const updated = pickpatch(picker)(patcher)(base);
    expect(updated).toEqual({ a: { b: 2 }, c: 6 });
  });

  it("picks as any form", () => {
    const base = { a: { b: 1 }, c: 2 };
    const picker = (obj: any) => ({ d: obj.a.b, e: [obj.c] });
    const patcher = ({ d, e }: any) => ({ d: d + 1, e: [(d + 10) * e[0]] });
    const updated = pickpatch(picker)(patcher)(base);
    expect(updated).toEqual({ a: { b: 2 }, c: 22 });
  });

  it("can pick as null", () => {
    const base = { a: { b: 1 }, c: 2 };
    const picker = (obj: any) => null;
    const patcher = () => null;
    const updated = pickpatch(picker)(patcher)(base);
    expect(updated).toEqual({ a: { b: 1 }, c: 2 });
  });
});
