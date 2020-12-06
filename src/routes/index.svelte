<script>
  import OctalInput from "../components/OctalNumberInput.svelte";
  import ModeStringInput from "../components/ModeStringInput.svelte";
  import { blankFileMode } from "../lib/parse";
  let value = 0;
  let mode = blankFileMode();
</script>

<style>
</style>

<svelte:head>
  <title>POSIX file mode explainer</title>
</svelte:head>

<OctalInput bind:value maxlength="5" />
<br />
<ModeStringInput bind:value={mode} />
