<script>
  let { load } = $props();
  let a = $state(0);
  a = /* c */ await load();
  let b = $derived(a === /* d */ await load());
</script>
{a}{b}
