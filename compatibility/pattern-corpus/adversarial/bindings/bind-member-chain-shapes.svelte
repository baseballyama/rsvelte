<script>
  let form = $state({ nested: { name: "a" }, list: [{ v: 1 }] });
  const key = "name";
  let el = $state(null);
</script>

<input bind:value={form.nested.name} />
<input bind:value={form.nested[key]} />
<input bind:value={form.list[0].v} />
<input bind:value={form["nested"]["name"]} />
<div bind:this={el}>x</div>
<b>{form.nested.name}{form.list[0].v}{el ? 1 : 0}</b>
