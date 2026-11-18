<script>
  let { load } = $props();
  let a = $derived(/* c */ await load()), b = $derived(/* d */ await load());
</script>
{a}{b}
