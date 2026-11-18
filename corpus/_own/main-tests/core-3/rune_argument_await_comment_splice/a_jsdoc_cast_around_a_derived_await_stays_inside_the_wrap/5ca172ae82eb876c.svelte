<script>
  let { load } = $props();
  let b = $derived(/** @type {R} */ (await load()));
</script>
{b}
