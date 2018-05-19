type Picker<T, U> = (base: T) => U;
type Patcher<U> = (picked: U) => U;

const pickpatch = <T, U>(picker: Picker<T, U>) => (patcher: Patcher<U>) => (
  base: T,
): T => {
  const { pick, patch } = parsePicker(picker);
  return patch(base, patcher(pick(base)));
};
export default pickpatch;

interface PickerParser<T, U> {
  pick: (base: T) => U;
  patch: (base: T, value: any) => T;
}
// tslint:disable-next-line:interface-over-type-literal
type Trap = {};
type Path = PropertyKey[];
function parsePicker<T, U>(picker: Picker<T, U>): PickerParser<T, U> {
  const createGetKeyTrap = (keys: Path): Trap =>
    new Proxy(
      { [trapKeys]: keys },
      {
        get: (target, p) =>
          p === trapKeys ? target[trapKeys] : createGetKeyTrap([...keys, p]),
      },
    );
  const trap: any = createGetKeyTrap([]);
  const structure = picker(trap);
  const pathPairs = parsePathPairs(structure);

  const pick = (base: T): U =>
    pathPairs.reduce(
      (accu, [basePath, pickPath]) =>
        setPath(pickPath, accu, getPath(basePath, base)),
      structure,
    );
  const patch = (base: T, value: any): T =>
    pathPairs.reduce(
      (accu, [basePath, pickPath]) =>
        setPath(basePath, accu, getPath(pickPath, value)),
      base,
    );

  return { pick, patch };
}

const trapKeys = Symbol();
function isTrap(obj: any): obj is Trap {
  if (typeof obj !== "object" || obj === null) return false;
  return trapKeys in obj;
}

function parsePathPairs(s: any): Array<[Path, Path]> {
  if (isTrap(s)) return [[(s as any)[trapKeys], []]];

  if (Array.isArray(s)) {
    return s
      .map((v, k) =>
        parsePathPairs(v).map(
          ([basePath, pickPath]) =>
            [basePath, [k, ...pickPath]] as [Path, Path],
        ),
      )
      .reduce((accu, v) => accu.concat(v), []);
  }

  if (typeof s === "object" && s !== null) {
    return Object.keys(s)
      .map(k =>
        parsePathPairs(s[k]).map(
          ([basePath, pickPath]) =>
            [basePath, [k, ...pickPath]] as [Path, Path],
        ),
      )
      .reduce((accu, v) => accu.concat(v), []);
  }

  return [];
}

function getPath(path: Path, base: any): any {
  if (path.length === 0) return base;
  const [p, ...ps] = path;
  return getPath(ps, base[p]);
}

function setPath(path: Path, base: any, value: any): any {
  if (path.length === 0) return value;
  const [p, ...ps] = path;
  return Array.isArray(base) && typeof p === "number"
    ? [...base.slice(0, p), setPath(ps, base[p], value), ...base.slice(p + 1)]
    : { ...base, [p]: setPath(ps, base[p], value) };
}
