<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let value = 1;
</script>

<!-- #region layout -->
<div class="wrap">
  {#each [1, 2] as n}
    <p title="row">{n}</p>
  {/each}
</div>
<!-- #endregion -->

<style>
  .wrap {
    color: red;
  }
</style>
