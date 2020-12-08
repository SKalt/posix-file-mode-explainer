<script lang="ts">
  import OctalInput from "../components/OctalNumberInput.svelte";
  import ModeStringInput from "../components/ModeStringInput.svelte";
  import ModeTable from "../components/ModeTable.svelte";
  import ModeStringExplainer from "../components/ModeStringExplainer.svelte";

  import type { FileMode } from "../lib/parse";

  import { mode } from "../stores";
  import {
    parseNumber,
    parseOctal,
    parseStr,
    modeAsString,
    toDecimal,
  } from "../lib/parse";
  if (typeof window !== "undefined") {
    const hash = window.location.hash.slice(1);
    if (hash.length > 3) {
      try {
        let m = parseStr(hash);
        mode.update(() => m);
      } catch {
        try {
          let m = parseOctal(hash);
          mode.update(() => m);
        } catch {}
      }
    }
  }
  let octal: number;
  const octalLength = 6;
  const modeStrLength = 10;
  mode.subscribe((m: FileMode) => {
    octal = toDecimal(m);
    const str = modeAsString(m);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, str, `#${str}`);
    }
  });
  $: mode.update(() => parseNumber(octal));
</script>

<style>
  @media (prefers-color-scheme: dark) {
    :global(*) {
      background-color: black;
      color: white;
    }
  }
  div.row {
    display: grid;
    grid-template-columns: 1fr 3fr;
    width: 100%;
  }

  div.row span:first-child {
    grid-column: 1;
    /* flex-grow: 1; */
    text-align: center;
    margin-right: 1em;
    width: 100%;
  }
  div.row span:first-child::after {
    content: ":";
    text-align: right;
  }
  :global(div.row *:nth-child(2)) {
    grid-column: 2;
    width: 100%;
  }
</style>

<svelte:head>
  <title>POSIX file mode explainer</title>
</svelte:head>

<div class="row">
  <span>Octal</span>
  <OctalInput bind:value={octal} maxlength={octalLength} />
</div>
<div class="row">
  <span>Mode string</span>
  <ModeStringInput store={mode} />
</div>
<br />
<ModeTable store={mode} />
<ModeStringExplainer store={mode} />
