<svelte:options runes={false} />

<script>
  export let seed = 1;

  let text = "}";

  $: closing = `${seed} }`;
  $: opening = "{ ( [";
  $: pattern = /[)}\]]/g;
  $: table = { "k}": ")" };
  $: if (text === "}") {
    text = "})";
  }
  $: {
    const local = "} inside a block";
    void local;
  }
  $: label = [closing, opening, pattern.source, table["k}"]].join("|");
</script>

<b>{label}{text}</b>
