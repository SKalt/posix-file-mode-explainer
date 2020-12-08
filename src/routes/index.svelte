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
    display: flex;
    width: 100%;
  }

  :global(div.row *:first-child) {
    flex-grow: 1;
    text-align: right;
    margin-right: 1em;
  }
  :global(div.row *:nth-child(2)) {
    flex-grow: 1;
  }
</style>

<svelte:head>
  <title>POSIX file mode explainer</title>
</svelte:head>

<div class="row">
  <span style="width: {octalLength}ch">Octal:</span>
  <OctalInput bind:value={octal} maxlength={octalLength} />
</div>
<div class="row">
  <span style="width: {modeStrLength}ch">Mode string:</span>
  <ModeStringInput store={mode} />
</div>

<ModeTable store={mode} />

<ModeStringExplainer store={mode} />
