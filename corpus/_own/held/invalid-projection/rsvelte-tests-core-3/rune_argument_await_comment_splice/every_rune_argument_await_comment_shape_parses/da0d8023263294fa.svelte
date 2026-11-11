<script>
  let { load } = $props();
  let a = $derived(await // c
    load());
</script>
{a}
