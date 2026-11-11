<script>
  import { flip } from "svelte/animate";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  let rows = $state([{ id: 1 }, { id: 2 }, { id: 3 }]);

  function shuffle() {
    rows = rows.slice().reverse();
  }
</script>

{#each rows as row (row.id)}
  <div animate:flip>{row.id}</div>
{/each}

{#each rows as row (row.id)}
  <div
    animate:flip={{ duration: 100, delay: 10, easing: cubicOut }}
    transition:fade
  >
    {row.id}
  </div>
{/each}

<button onclick={shuffle}>go</button>
