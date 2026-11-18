<script>
  const initial = await Promise.resolve(2);
  let value = $state(initial);
  let double = $derived(await Promise.resolve(value * 2));
  let later = $derived((await Promise.resolve(value)) + value);
  let simple = $derived(double + 1);
</script>
<button onclick={() => value++}>change</button>
<p>{value}:{double}:{later}:{simple}</p>
