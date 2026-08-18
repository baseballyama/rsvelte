<script>
  /* eslint svelte/consistent-selector-style: ["warn", { "style": ["id", "class"] }] */
  let items = [1, 2];
</script>

<ul>
  {#each items as item (item)}
    <li class="item">{item}</li>
  {/each}
</ul>
<div class="once">outside each</div>

<style>
  .item {
    color: red;
  }
  .once {
    color: blue;
  }
</style>
