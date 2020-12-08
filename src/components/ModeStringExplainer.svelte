<script lang="ts">
  import type { MainStore } from "../stores";
  import type { FileMode, Triad } from "../lib/parse";
  import { modeAsString } from "../lib/parse";

  export let store: MainStore;
  let mode: FileMode;
  export let selectedSection: keyof FileMode = "special";
  export let selectedIndex: number = 0;
  let letters: string[];
  const unsubscribe = store.subscribe((m: FileMode) => {
    mode = m;
    letters = modeAsString(m).split("");
  });
  const selectLetter = (index: number) => () => {
    selectedIndex = index;
  };
  const getSection = (index: number) => {
    switch (Math.floor((index - 1) / 3)) {
      case 0:
        return "user";
      case 1:
        return "group";
      case 2:
        return "other";
      default:
        return "special";
    }
  };
  let who: string;
  let anySpecial: string;
  let text: string;
  $: selectedSection = getSection(selectedIndex);
  $: {
    who =
      {
        user: "The current user",
        group: "Users in the current group",
        other: "Others",
        special: "This file",
      }[selectedSection] || "";
  }
  $: {
    let section = mode[selectedSection];
    let { sticky, setgid, setuid } = mode.special;
    if ("executable" in section && (sticky || setgid || setuid)) {
      const { executable } = section;
      const conj = executable ? "and" : "but";
      const prefix = `, ${conj} can `;
      switch (who) {
        case "user":
          anySpecial = setuid ? prefix + "set the user id" : "";
          break;
        case "group":
          anySpecial = setgid ? prefix + "set the group" : "";
          break;
        case "other":
          anySpecial = sticky ? `, ${conj} the file has the sticky bit` : "";
          break;
        default:
          anySpecial = "!";
          break;
      }
    } else {
      anySpecial = "";
    }
  }
  $: {
    if (selectedSection === "special") {
      text = {
        "-": "'s type is 'regular'",
        l: " is a symbolic link",
        d: " is a directory",
        p: " is a named pipe",
        s: " is a socket",
        c: " is a character device",
        b: " is a block device",
        D:
          "This file is a door (for inter-process communication between a client and server; only implemented in Solaris).",
      }[letters[0]];
    } else {
      let permission =
        ["read", "write", "execute"][(selectedIndex - 1) % 3] || "";
      const conj = permission ? "" : "not";
      text = ` can${conj} ${permission} the file${anySpecial}.`;
    }
  }
  function handleKeypress(
    e: Event & KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    switch (e.key) {
      case "ArrowLeft":
        return selectedIndex--;
      case "ArrowRight":
        return selectedIndex++;
    }
  }
</script>

<style>
  div {
    margin: 1em;
    text-align: center;
  }
  div.big {
    font-size: 34pt;
    font-family: monospace;
  }

  .mode-string-part--selected {
    text-decoration: underline;
  }
  .mode-string-triad--selected {
    background-color: #666;
    color: white;
  }
  .mode-string-part:hover {
    text-decoration: underline dotted;
    font-weight: bolder;
  }
</style>

<div class="big">
  {#each letters as letter, index}
    <span
      tabindex="0"
      class:mode-string-part--selected={selectedIndex === index}
      class:mode-string-triad--selected={selectedSection === getSection(index)}
      class="mode-string-part mode-string-triad--{getSection(index)}"
      on:click={selectLetter(index)}
      on:focus={selectLetter(index)}
      on:keydown={handleKeypress}>{letter}</span>
  {/each}
</div>
<div><span class="mode-string-triad--selected">{who}</span>{text}</div>
