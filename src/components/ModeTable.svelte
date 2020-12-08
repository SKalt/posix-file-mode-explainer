<script lang="ts">
  import TriadRow from "./ModeTableRow.svelte";
  import Cell from "./ModeTableRowCell.svelte";
  import type { Writable } from "svelte/store";
  import type { FileMode } from "../lib/parse";
  export let store: Writable<FileMode>;
</script>

<style>
  table.permissions-table {
    border-collapse: collapse;
    /* border: 1px solid black; */
    width: 100%;
  }
  th.permission-header {
    text-align: center;
    border: none;
    border-bottom: none;
  }
  div {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>

<div>
  <table class="permissions-table">
    <thead>
      <tr>
        <th />
        <th class="permission-header">read</th>
        <th class="permission-header">write</th>
        <th class="permission-header">execute</th>
      </tr>
    </thead>
    <tbody>
      <TriadRow {store} section="user" />
      <TriadRow {store} section="group" />
      <TriadRow {store} section="other" />
      <tr>
        <th />
        <th class="permission-header">set uid</th>
        <th class="permission-header">set gid</th>
        <th class="permission-header">sticky</th>
      </tr>
      <TriadRow
        {store}
        section="special"
        keys={['setuid', 'setgid', 'sticky']} />
    </tbody>
  </table>
</div>
