<script>
  let { broken = false, record = () => {} } = $props();
  $effect(() => {
    if (broken) throw new Error('effect');
    record('run');
    return () => record('cleanup');
  });
</script>
<p>child</p>
