<script>
  let { load } = $props();
  let a = $derived(/* c */ await load() + /* d */ await load());
</script>
{a}
