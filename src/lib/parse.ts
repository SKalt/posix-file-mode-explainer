// https://man7.org/linux/man-pages/man7/inode.7.html
// https://pubs.opengroup.org/onlinepubs/9699919799/utilities/ls.html
// https://nixdoc.net/man-pages/FreeBSD/man2/stat.2.html
// https://github.com/mirror/busybox/blob/6599e380ed5e1b1272a5e0e26183471d8b4b2051/libbb/mode_string.c
// POSIX leaves the following symbolic constants to be defined in <sys/stat.h>:
// S_IFSOCK             Socket.
// S_IFLNK              Symbolic link.
// S_IFDIR              Directory.
// S_IFREG              Regular.
// S_IFIFO              FIFO special.
// S_IFCHR              Character special.
// S_IFBLK              Block special.

// linux: https://man7.org/linux/man-pages/man7/inode.7.html
// S_IFSOCK   0140000   socket
// S_IFLNK    0120000   symbolic link
// S_IFREG    0100000   regular file
// S_IFBLK    0060000   block device
// S_IFDIR    0040000   directory
// S_IFCHR    0020000   character device
// S_IFIFO    0010000   FIFO -- named pipe

// the BSDs and OSX, as exemplified at https://nixdoc.net/man-pages/FreeBSD/man2/stat.2.html additionally have
// S_IFWHT    0160000   whiteout

// minix seems to be missing a S_IFSOCK from the linux set: https://www.unix.com/man-page/minix/2/stat/
// plan 9 uses similar permission bits, but has a longer binary mode with different filetypes:  https://www.unix.com/man-page/plan9/2/stat/
// The bits in mode are defined by
// 0x80000000   directory
// 0x40000000   append only
// 0x20000000   exclusive use (locked)
//
// 0400   read permission by owner // same
// 0200   write permission by owner
// 0100   execute permission (search on directory) by owner
// 0070   read, write, execute (search) by group
// 0007   read, write, execute (search) by others

// https://nixdoc.net/man-pages/NetBSD/man2/stat.2.html
// netbsd has add'tl flags that go os.FileMode covers.
const sticky = 1 << 9;
const setgid = 1 << 10;
const setuid = 1 << 11;
const namedPipe = 1 << 12;
const characterDevice = 1 << 13;
const directory = 1 << 14;
const regularFile = 1 << 15;
const socket = directory | regularFile;
const blockDevice = characterDevice | directory;
const symbolicLink = characterDevice | regularFile;
const whiteout = (1 << 15) | (1 << 14) | (1 << 13);

const significantBitShifts = {
  sticky,
  setgid,
  setuid,
  namedPipe,
  characterDevice,
  directory,
  regularFile,
  socket,
  blockDevice,
  symbolicLink,
  whiteout,

  // irregular: 19,
  // device: 26,
  // temporaryFile: 28, // plan 9 only
  // exclusiveUse: 29,
  // appendOnly: 30,
};
type SignificantName = keyof typeof significantBitShifts;
const significantOrder = Object.keys(significantBitShifts) as SignificantName[];

const specialStrs: Record<string, SignificantName> = {
  l: "symbolicLink",
  b: "blockDevice",
  s: "socket",
  d: "directory",
  c: "characterDevice",
  p: "namedPipe",
};
const _specialStrs = {
  symbolicLink: "l",
  blockDevice: "b",
  socket: "s",
  directory: "d",
  characterDevice: "c",
  namedPipe: "p",
};
export interface Triad {
  read: boolean;
  write: boolean;
  execute: boolean;
}
export type Special = {
  [sig in SignificantName]: boolean;
};
export type Permissions = {
  user: Triad;
  group: Triad;
  other: Triad;
};
export type FileMode = Permissions & {
  special: Special;
};

const maxU32 = Math.pow(2, 32);

export const parseNumber = (n: number): FileMode => {
  if (n < 0 || n > maxU32) {
    throw new Error(
      `invalid file mode ${n}; file modes should be between 0 and 2^32 = ${maxU32}`
    );
  }
  const result = blankFileMode();
  let special = Object.entries(significantBitmasks).reduce(
    (
      a: Partial<Special>,
      [name, mask]: [SignificantName, Bitmask]
    ): Partial<Special> => Object.assign(a, { [name]: mask(n) }),
    {}
  );
  result.special = Object.assign(result.special, special);
  const _t = (x: { [k in keyof Triad]: Bitmask }) =>
    Object.entries(x).reduce(
      (
        a: Partial<Triad>,
        [name, mask]: [keyof Triad, Bitmask]
      ): Partial<Triad> => Object.assign(a, { [name]: mask(n) }),
      {}
    );
  result.user = Object.assign(result.user, _t(_usr));
  result.group = Object.assign(result.group, _t(_group));
  result.other = Object.assign(result.other, _t(_other));
  return result;
};

const asRwx = (t: Triad) => [
  // TODO: better name
  t.read ? "r" : "-",
  t.write ? "w" : "-",
  t.execute ? "x" : "-",
];
const asSpecial = (s: Special) =>
  s["symbolicLink"]
    ? _specialStrs["symbolicLink"]
    : s["blockDevice"]
    ? _specialStrs["blockDevice"]
    : s["socket"]
    ? _specialStrs["socket"]
    : s["directory"]
    ? _specialStrs["directory"]
    : s["characterDevice"]
    ? _specialStrs["characterDevice"]
    : s["namedPipe"]
    ? _specialStrs["namedPipe"]
    : "-";

type Bitmask = (u32: number) => boolean;
const singleBitMask = (m: number): Bitmask => (u32: number): boolean =>
  1 << m === (u32 & (1 << m));

const significantBitmasks = significantOrder.reduce(
  (a, name) =>
    Object.assign(a, {
      [name]: (n: number) =>
        (n & significantBitShifts[name]) === significantBitShifts[name],
    }),
  {} as Record<keyof typeof significantBitShifts, Bitmask>
);

const _t = (n: number) => ({
  read: singleBitMask(n),
  write: singleBitMask(n - 1),
  execute: singleBitMask(n - 2),
});
const _usr = _t(8);
const _group = _t(5);
const _other = _t(2);

const _rwx = (f: Permissions) => [
  asRwx(f.user),
  asRwx(f.group),
  asRwx(f.other),
];
const permAsStringArr = (p: Permissions): string[] => [].concat(..._rwx(p));
const modeAsStringArr = (f: FileMode): Array<string> => {
  const perm = permAsStringArr(f);
  if (f.special.setuid) perm[2] = f.user.execute ? "s" : "S";
  if (f.special.setgid) perm[5] = f.group.execute ? "s" : "S";
  if (f.special.sticky) perm[8] = f.other.execute ? "t" : "T";
  return asSpecial(f.special).split("").concat(perm);
};

export const modeAsString = (f: FileMode): string =>
  modeAsStringArr(f).join("");
export const permAsString = (f: Permissions): string =>
  permAsStringArr(f).join("");

const asBinary = (n: number): Array<0 | 1> =>
  n
    .toString(2)
    .padStart(16, "0")
    .split("")
    .map((b) => (parseInt(b) == 0 ? 0 : 1));

const stringOrNumber = <T>(
  ifStr: (s: string) => T,
  ifNumber: (n: number) => T
) => (input: string | number): T => {
  if (typeof input === "string") return ifStr(input);
  else if (typeof input === "number" && Number.isNaN(input))
    return ifNumber(input);
  else {
    throw new Error(`invalid string/number ${input}`);
  }
};
export const octalToDecimal = (octal: string) => parseInt(octal, 8);
const parseOctalStr = (octal: string): FileMode => {
  return parseNumber(octalToDecimal(octal));
};
const parseOctalNumber = parseNumber;
export const parseOctal = stringOrNumber(parseOctalStr, parseOctalNumber);

export const blankTriad = () => ({ read: false, write: false, execute: false });
export const blankSpecial = () =>
  significantOrder.reduce(
    (a, name) => Object.assign(a, { [name]: false }),
    {} as Record<SignificantName, boolean>
  );
export const blankFileMode = (): FileMode => ({
  user: blankTriad(),
  group: blankTriad(),
  other: blankTriad(),
  special: blankSpecial(),
});

export const parseStr = (s: string): FileMode => {
  const result = blankFileMode();
  if (s.length != 10) {
    throw new Error(
      `invalid mode string '${s}': must be 10 characters, is ${s.length}`
    );
  }
  let i = 0; // the index into the string s
  const err = (c: string) =>
    new Error(`unexpected letter ${c} in file mode string '${s}'`);

  const match: SignificantName | undefined = specialStrs[s[i++]];
  if (match) result.special[match] = true;

  let p = s.slice(i);

  const _v = <S extends string>(s: S) => (c: string): c is S => {
    if (c === s) return true;
    else if (c === "-") return false;
    else if (c === "s" || c === "t") return true;
    else if (c === "S" || c === "T") return false;
    else throw err(c);
  };
  const [_r, _w, _x] = [_v("r"), _v("w"), _v("x")];
  const _t = (i: number): Triad => ({
    read: _r(p[i + 0]),
    write: _w(p[i + 1]),
    execute: _x(p[i + 2]),
  });
  result.user = _t(0);
  result.group = _t(3);
  result.other = _t(6);
  result.special.setuid = p[2] === "s" || p[2] === "S";
  result.special.setgid = p[5] === "s" || p[5] === "S";
  result.special.sticky = p[8] === "T" || p[8] === "t";
  return result;
};

export const toDecimal = (f: FileMode): number => {
  let n = 0;
  Object.entries(f.special).forEach(([k, v]) => {
    if (v) n += significantBitShifts[k];
  });
  [f.user, f.group, f.other].forEach((t, i) => {
    Object.entries(t).forEach(([k, v]: [keyof Triad, boolean], j) => {
      if (v) n += 1 << (8 - 3 * i - j);
    });
  });
  return n;
};

export const numberToOctal = (n: number, digits: number) =>
  n.toString(8).padStart(digits, "0");
// const parseHex = (h: string | number)  =>
export const modeToOctal = (f: FileMode): string =>
  numberToOctal(toDecimal(f), 5);
// TODO: symbolic
// TODO: hex ('cause why not)
// TODO: create os-sets of Specials
