import { FileMode, blankFileMode } from "./lib/parse";

import type { Writable } from "svelte/store";
import { writable } from "svelte/store";

export type MainStore = Writable<FileMode>;
// TODO: pull from location.hash
export const mode: MainStore = writable(blankFileMode());
export interface Selection {
  section: keyof FileMode;
  modeStringIndex: number; // 1-10
}
export const selection: Writable<Selection> = writable({
  section: "user",
  modeStringIndex: 1,
});
