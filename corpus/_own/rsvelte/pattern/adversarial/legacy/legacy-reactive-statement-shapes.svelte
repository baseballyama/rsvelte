<svelte:options runes={false} />

<script>
  export let input = 1;

  let doubled;
  let label = "";

  $: doubled = input * 2;
  $: if (doubled > 2) {
    label = "big";
  } else {
    label = "small";
  }
  $: ({ length: labelLength } = label);
  $: [firstChar] = label;
  $: {
    const local = doubled;
    label = label + local;
  }
  $: console.log(doubled);
</script>

<b>{doubled}{label}{labelLength}{firstChar}</b>
