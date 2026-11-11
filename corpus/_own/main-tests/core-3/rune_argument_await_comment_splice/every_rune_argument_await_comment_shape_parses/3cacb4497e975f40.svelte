<script>
  let { load } = $props();
  let a = $derived(/* c */ await load());
  let b = $derived(a + /* d */ await load());
</script>
{a}{b}
