<script lang="ts">
  import TriadCell from "./ModeTableRowCell.svelte";

  import type { MainStore } from "../stores";
  import type { Permissions, FileMode, Triad } from "../lib/parse";

  type Key = keyof Triad | keyof FileMode["special"];

  export let keys: [Key, Key, Key] = ["read", "write", "execute"];
  export let section: keyof FileMode;
  export let store: MainStore;
</script>

<tr class="permission-row permission-row--{section}">
  <th class="permission-header">{section}</th>
  {#each keys as key}
    <TriadCell {store} {section} {key} />
  {/each}
</tr>
