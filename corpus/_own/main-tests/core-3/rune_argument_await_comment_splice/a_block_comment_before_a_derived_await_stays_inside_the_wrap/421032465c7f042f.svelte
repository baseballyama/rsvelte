<script>
  let { load } = $props();
  let a = $derived(/* c */ await load());
</script>
{a}
