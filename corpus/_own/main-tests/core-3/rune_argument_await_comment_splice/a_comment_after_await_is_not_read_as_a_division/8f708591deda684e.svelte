<script>
  let { load } = $props();
  let c = $derived((await /* y */ load()) + 1);
</script>
{c}
