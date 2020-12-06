<script lang="ts">
  import type { FileMode, Triad } from "../lib/parse";
  import { modeAsString, blankFileMode, parseStr } from "../lib/parse";
  import { afterUpdate } from "svelte";
  export let value: FileMode = blankFileMode();
  let caretPosition = 0;
  let modeString = modeAsString(value);
  let input: HTMLInputElement;
  afterUpdate(() => {
    input.selectionEnd = caretPosition;
  });
  // const getCurrentSection = (pos: number): null | keyof FileMode => {
  //   switch (pos) {
  //     case 0:
  //       /* |drwxrwxrwx */ return "special";
  //     case 1:
  //       /* d|rwxrwxrwx */ return "special"; // TODO: -> user
  //     case 2:
  //       /* dr|wxrwxrwx */ return "user";
  //     case 3:
  //       /* drw|xrwxrwx */ return "user";
  //     case 4:
  //       /* drwx|rwxrwx */ return "user";
  //     case 5:
  //       /* drwxr|wxrwx */ return "group";
  //     case 6:
  //       /* drwxrw|xrwx */ return "group";
  //     case 7:
  //       /* drwxrwx|rwx */ return "group";
  //     case 8:
  //       /* drwxrwxr|wx */ return "other";
  //     case 9:
  //       /* drwxrwxrw|x */ return "other";
  //     default:
  //       /* drwxrwxrwx| */ return null;
  //   }
  // };
  // const interpretFirstChar = () => "";

  // const getTriadPosition = (pos: number): null | keyof Triad => {
  //   if (pos === 0 || pos >= 10) return null; // |drwxrwxrwx, drwxrwxrwx|

  //   switch ((pos - 1) % 3) {
  //     case 0: // d|rwxrwxrwx drwx|rwxrwx drwxrwx|rwx
  //       return "read";
  //     case 1: // dr|wxrwxrwx drwxr|wxrwx drwxrwxr|wx
  //       return "write";
  //     case 2: // drw|xrwxrwx drwxrw|xrwx drwxrwxrw|x
  //       return "execute";
  //     default:
  //       return null;
  //   }
  // };
  const _orders = {
    special: "-lbsdcp", // ordered by hightest bits -> lowest
    read: "-r",
    write: "-w",
    execute: { s: "S-xs", t: "T-xt" },
  };
  // const getValueActions = (
  //   section: keyof FileMode | null,
  //   subsection: keyof Triad | null
  // ): [(yn: boolean) => void, () => void] => {
  //   // incr/decr, reset
  //   let setTriadValue = (yn) => {
  //     value[section][subsection] = yn;
  //     value = value;
  //   };
  //   let incrDecr: (yn: boolean) => void;

  //   switch (subsection) {
  //     case "read":
  //     case "write":
  //       return [setTriadValue, () => setTriadValue(false)];
  //     case "execute":
  //       switch (section) {
  //         case "user":
  //         // S no-execute, setuid
  //         // - no-execute, no-setuid
  //         // x execute   , no-setuid
  //         // s execute   , setuid
  //         incrDecr = (up: boolean) => {
  //           if (value.special.setuid) {
  //             if (value.user.execute) value.special.setuid = up
  //             else if (up) value.special.setuid = false
  //         }
  //         case "group":
  //         // S no-execute, setgid
  //         // - no-execute, no-setgid
  //         // x execute   , no-setgid
  //         // s execute   , setgid

  //         case "other":
  //         // T no-execute, sticky
  //         // - no-execute, no-sticky
  //         // x execute   , no-sticky
  //         // t execute   , sticky

  //         default:
  //           return null; // something's wrong...
  //       }
  //     case null:
  //     // handle special-group?
  //   }
  // };
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
    value = parseStr(letters.join(""));
    return;
  }

  function handleInput(
    e: Event & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    value = parseStr(e.currentTarget.value);
  }
  $: modeString = modeAsString(value);
</script>

<style>
  input {
    font-family: monospace;
    max-width: 10ch;
  }
</style>

<input
  type="text"
  bind:this={input}
  value={modeString}
  on:keydown={handleKeypress}
  on:input={handleInput} />
<!-- pattern="^[[-dlsbc]]([r-][w-][xsS-])([r-][w-][xsS-])([r-][w-][xtT-])$" -->
