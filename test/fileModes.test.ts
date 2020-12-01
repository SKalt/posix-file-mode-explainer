/// <reference types="jest" />
// for jest
import allFileModes from "./allFileModes.json";
import {
  parseOctal,
  parseStr,
  modeAsString,
  toDecimal,
  octalToDecimal,
} from "../src/lib/parse";
import type { Special } from "../src/lib/parse";

describe("parsing octal, marshalling to str", () => {
  allFileModes.forEach(([octal, modeStr]) => {
    test(`correctly parses '${octal}' as '${modeStr}'`, () => {
      expect(modeAsString(parseOctal(octal)).slice(1)).toEqual(modeStr);
    });
  });
});

describe("parsing str, marshalling to decimal number", () => {
  allFileModes.forEach(([octal, modeStr]) => {
    test(`correctly parses '${modeStr}' as '${octal}'`, () => {
      expect(toDecimal(parseStr("-" + modeStr))).toEqual(octalToDecimal(octal));
    });
  });
});
test(`correctly parses sticky bit`, () => {
  expect(parseStr(`---------t`).special.sticky).toBe(true);
  expect(parseStr(`---------T`).special.sticky).toBe(true);
});
test(`correctly parses setuid s`, () => {
  const actual = parseStr(`---s------`);
  expect(actual.special.setuid).toBe(true);
  expect(actual.user.execute).toBe(true);
});
test(`correctly parses setuid S`, () => {
  const actual = parseStr(`---S------`);
  expect(actual.special.setuid).toBe(true);
  expect(actual.user.execute).toBe(false);
});
test(`correctly parses setgid s`, () => {
  const actual = parseStr(`------s---`);
  expect(actual.special.setgid).toBe(true);
  expect(actual.group.execute).toBe(true);
});
test(`correctly parses setgid S`, () => {
  const actual = parseStr(`------S---`);
  expect(actual.special.setgid).toBe(true);
  expect(actual.group.execute).toBe(false);
});
describe("parse special file types", () => {
  const _t = (c: string, prop: keyof Special) => {
    test(`'${c}' implies ${prop}`, () => {
      expect(parseStr(c + `---------`).special[prop]).toBe(true);
    });
  };
  _t("d", "directory");
  _t("b", "blockDevice");
  _t("c", "characterDevice");
  _t("l", "symbolicLink");
  _t("s", "socket");
  _t("p", "namedPipe");
});
