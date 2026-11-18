<svelte:options runes={false} />

<script>
  export let seed = 1;

  let log = [];

  $: fourth = third + 1;
  $: third = second + 1;
  $: second = first + 1;
  $: first = seed + 1;

  $: if (fourth > 0) {
    log = [...log, fourth];
  }

  $: {
    const local = first + second;
    void local;
  }

  $: ({ length: logLength } = log);

  $: [head = 0] = log;

  $: label = `${first}-${second}-${third}-${fourth}`;
</script>

<b>{label}{logLength}{head}</b>
