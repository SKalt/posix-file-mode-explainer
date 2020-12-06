<script lang="ts">
  import { numberToOctal, octalToDecimal } from "../lib/parse";
  import { afterUpdate, createEventDispatcher } from "svelte";

  // const dispatch = createEventDispatcher();

  // function warnInvalod() {
  //   dispatch("message", {
  //     text: "Hello!",
  //   });
  // }

  export let value = 0;
  /** the number of digits */
  export let maxlength = 1;
  /** Set to `true` for the input to be read-only */
  export let readonly = false;
  export let title = "";
  const min = 0;
  // reactive internals:
  let input: HTMLInputElement;
  let caretPosition: number;

  let octalRepr = numberToOctal(value, maxlength);
  let valid = true;
  afterUpdate(() => {
    input.selectionEnd = caretPosition;
  });
  let validator = `^[0-7]{${maxlength}}$`;
  const history: number[] = [];
  function handleKeypress(
    e: Event & KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    caretPosition = input.selectionEnd;
    let digits = Array.from(octalRepr);
    const incr = (increment: number = 1) => (index: number) => {
      // TODO: consider upping the prev digit when 7 is reached, decrementing the next digit when 0 reached
      digits[index] = String(
        Math.min(Math.max(parseInt(digits[index]) + increment, 0), 7)
      );
    };
    switch (e.key) {
      case "ArrowUp": // 012|3 -> 013|3
        e.preventDefault();
        // TODO: increment value by the number at the caret
        if (caretPosition == 0) {
          incr()(0);
        } else if (caretPosition < maxlength) {
          incr()(caretPosition - 1);
        } else if (caretPosition >= maxlength) {
          incr()(maxlength - 1);
        }
        break;
      case "ArrowDown": // 012|3 -> 011|3
        e.preventDefault();
        const decr = incr(-1);
        if (caretPosition == 0) {
          decr(1);
        } else if (caretPosition < maxlength) {
          decr(caretPosition - 1);
        } else if (caretPosition >= maxlength) {
          decr(maxlength - 1);
        }
        break;
      case "Backspace": // 012|3 -> 001|3
        e.preventDefault();
        if (caretPosition > 0) {
          digits.splice(caretPosition, 1);
          digits.unshift("0");
        }
        break;
      case "Delete": // 01|23 -> 001|3
        e.preventDefault();
        if (caretPosition < maxlength) {
          digits.splice(caretPosition++, 1);
          digits.unshift("0");
        }
        break;
      default:
        if (!/^[0-7]$/.test(e.key)) break; // TODO: raise validation warning
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
        if (caretPosition >= maxlength) {
          // push a new digit to the end of the octal string: 0012| -> 0123|
          digits = [...digits, e.key].slice(1);
        } else if (caretPosition == 0) {
          // |0123 -> 1|012
          digits = [e.key, ...digits].slice(0, maxlength);
        } else {
          // 01|23 -> 017|2
          digits.splice(caretPosition, 0, e.key);
          digits.slice(1, maxlength + 1);
        }
    }
    value = octalToDecimal(digits.join(""));
    return;
  }
  $: octalRepr = numberToOctal(value, maxlength);
</script>

<style>
  input {
    font-family: monospace;
  }
</style>

<input
  bind:this={input}
  type="text"
  pattern={validator}
  value={octalRepr}
  {readonly}
  {maxlength}
  {title}
  on:keydown={handleKeypress}
  style="max-width: {maxlength}ch" />

<!-- TODO: undo/redo stack -->
