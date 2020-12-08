<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { FileMode, Permissions, Triad } from "../lib/parse";
  import { yn } from "../lib/utils";
  export let store: Writable<FileMode>;
  export let section: keyof FileMode;
  export let key: keyof Triad | keyof FileMode["special"];
  let value: boolean;
  const unsubscribe = store.subscribe((mode: FileMode) => {
    value = mode[section][key];
  });
  const toggle = () => {
    store.update((v: FileMode) => {
      v[section][key] = !value;
      return v;
    });
  };
</script>

<style>
  td.permission-cell {
    text-align: center;
  }
  @media (prefers-color-scheme: light) {
    td.permission-cell {
      border: 1px solid black;
      background-color: rgb(248, 225, 225);
    }
    td.permission-cell.yes {
      background-color: rgb(228, 248, 225);
    }
  }
  @media (prefers-color-scheme: dark) {
    /* TODO: tweak colors */
    td.permission-cell {
      border: 1px solid white;
      background-color: rgb(95, 21, 21);
    }
    td.permission-cell.yes {
      background-color: rgb(21, 71, 12);
    }
  }
</style>

<td
  class="permission-cell permission-cell--{key}"
  class:yes={value}
  on:click={toggle}>
  {yn(value)}
</td>
