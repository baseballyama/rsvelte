<script>
  let text = $state('start');
  let number = $state(2);
  let checked = $state(false);
  let element = $state();
</script>
<input bind:value={() => text, (value) => text = value.toUpperCase()} />
<input type="number" bind:value={() => number, (value) => number = value} />
<input type="checkbox" bind:checked={() => checked, (value) => checked = value} />
<p bind:this={() => element, (value) => element = value}>{text}:{number}:{checked}</p>
