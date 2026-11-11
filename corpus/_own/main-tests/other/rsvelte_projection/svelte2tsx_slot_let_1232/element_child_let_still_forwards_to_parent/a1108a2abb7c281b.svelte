<script>
  import Preview from './Preview.svelte';
</script>

<Preview>
  <div let:value={v} let:set>
    {v}
  </div>
</Preview>
