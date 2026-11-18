<script>
  let { load } = $props();
  let a = $derived((await load()) + /* x */ load());
  let c = $derived((await /* y */ load()) + 1);
</script>
{a}{c}
