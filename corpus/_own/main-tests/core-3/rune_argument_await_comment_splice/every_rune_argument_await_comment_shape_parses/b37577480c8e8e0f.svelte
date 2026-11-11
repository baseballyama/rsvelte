<script>
  let { load } = $props();
  let [p] = $derived(/* c */ await load());
</script>
{p}
