<script lang="ts">
  import type { FileMode } from "../lib/parse";
  import { modeAsString, blankFileMode, parseStr } from "../lib/parse";
  import { afterUpdate } from "svelte";
  import type { Writable } from "svelte/store";
  import { writable } from "svelte/store";
  export let store: Writable<FileMode> = writable(blankFileMode());
  let value: FileMode;
  const unsubscribe = store.subscribe((v) => (value = v));
  let caretPosition = 0;
  let modeString = modeAsString(value);
  let input: HTMLInputElement;
  afterUpdate(() => {
    input.selectionEnd = caretPosition;
  });

  const _orders = {
    special: "-lbsdcp", // ordered by hightest bits -> lowest
    read: "-r",
    write: "-w",
    execute: { s: "S-xs", t: "T-xt" },
  };

  const getOrder = (pos: number): string => {
    switch (caretPosition) {
      case 0: // |drwxrwxrwx
        return _orders["special"];
      case 1: // d|rwxrwxrwx
      case 4: // drwx|rwxrwx
      case 7: // drwxrwx|rwx
        return _orders["read"];
      case 2: // dr|wxrwxrwx
      case 5: // drwxr|wxrwx
      case 8: // drwxrwxr|wx
        return _orders["write"];
      case 3: // drw|xrwxrwx
      case 6: // drwxrw|xrwx
        return _orders["execute"]["s"];
      case 9:
      case 10:
        return _orders["execute"]["t"];
    }
  };
  const clamp = (min: number, max: number) => (n: number) =>
    Math.min(max, Math.max(min, n));

  function handleKeypress(
    e: Event & KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    const letters = Array.from(modeString);
    caretPosition = input.selectionEnd;
    let pos = clamp(0, letters.length - 1)(caretPosition);
    let current = letters[pos];
    let order = getOrder(pos);
    const incr = (i: number) =>
      (letters[pos] =
        order[(order.length + order.indexOf(current) + i) % order.length]);

    switch (e.key) {
      case "ArrowUp":
        // -rw|-r-xr-x -> -rw|xr-xr-x -> -rw|sr-xr-x -> -rw|Sr-xr-x
        e.preventDefault();
        incr(+1);
        break;
      case "ArrowDown": // -rw-|r-xr-x -> -rwx|r-xr-x -> -rws|r-xr-x -> -rwS|r-xr-x
        e.preventDefault();
        incr(-1);
        break;
      case "Backspace": // drwxrwx|rwx -> drwxrw|-rwx
        e.preventDefault();
        if (caretPosition > 0 && caretPosition <= letters.length) {
          caretPosition -= 1;
          letters[caretPosition] = "-";
        }
        break;
      case "Delete": // drwxrwx|rwx -> drwxrwx-|wx
        e.preventDefault();
        if (caretPosition >= 0 && caretPosition < letters.length) {
          caretPosition += 1;
          if (caretPosition < letters.length) {
            letters[caretPosition] = "-";
          }
        }
        break;
      default:
        if (e.metaKey) {
          if (e.ctrlKey) {
            if (e.key == "z") {
              // TODO: undo
            } else if (e.key == "y") {
              // TODO: redo
            }
          }
          break;
        }
        if (!order.includes(e.key)) break; // TODO: raise validation warning
        if (caretPosition >= 0 && caretPosition < letters.length) {
          // overwrite with the allowed letter: -|---r--r-- -> -r|--r--r--
          letters[caretPosition] = e.key;
          caretPosition++;
        }
        break;
    }
    store.update(() => parseStr(letters.join("")));
    return;
  }

  function handleInput(
    e: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    store.update(() => parseStr(e.currentTarget.value));
  }
  $: modeString = modeAsString(value);
</script>

<style>
  input {
    font-family: monospace;
    width: 10ch;
  }
</style>

<input
  type="text"
  bind:this={input}
  value={modeString}
  on:keydown={handleKeypress}
  on:input={handleInput} />
<!-- pattern="^[[-dlsbc]]([r-][w-][xsS-])([r-][w-][xsS-])([r-][w-][xtT-])$" -->
