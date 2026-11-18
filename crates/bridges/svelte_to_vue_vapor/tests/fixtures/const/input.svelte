<script>let count = $state(1); let values = $state([2, 3]);</script>
<button onclick={() => count++}>increment</button>
{#if count > 0}
  {@const doubled = count * 2}
  <p>{doubled}</p>
  {#each values as value}
    {@const total = value + doubled}
    <i>{total}</i>
  {/each}
{/if}
