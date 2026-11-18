<script>
  let { load } = $props();
  let { x } = $derived(/* c */ await load());
</script>
{x}
