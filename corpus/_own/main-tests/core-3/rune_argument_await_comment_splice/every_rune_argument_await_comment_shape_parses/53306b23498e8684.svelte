<script>
  let { load } = $props();
  let a = $derived(/* c */ (await load()).x);
</script>
{a}
