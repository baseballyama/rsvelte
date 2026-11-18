<svelte:options runes={false} />

<script>
  export let seed = 1;

  let a;
  let b;
  let c;

  $: c = b + 1;
  $: b = a * 2;
  $: a = seed + 1;

  $: total = a + b + c;

  let log = [];
  $: log = [...log, total].slice(-2);
</script>

<b>{a}{b}{c}{total}{log.length}</b>
