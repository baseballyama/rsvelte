<script>
  let { items, title = "List" } = $props();
  let total = $derived(items.length * 2 + 1);
</script>

<section class="list" data-count={total}>
  <h2>{title}</h2>
  {#if items.length > 0}<p>
      {total} items, the first one is {items[0]} and there is a long tail of text
      here
    </p>{:else}<p>none</p>{/if}
</section>

<style>
  .list {
    color: red;
    margin: 0 auto;
  }
  h2 {
    font-weight: bold;
  }
</style>
