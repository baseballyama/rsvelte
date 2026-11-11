<script>
	let obj = $state({ deep: { 'k e y': 'v', 'quo"te': 'q' } });
	let arr = $state([{ v: 'first' }]);
	let i = $state(0);
</script>

<input bind:value={obj.deep['k e y']} />
<input bind:value={obj.deep['quo"te']} />
<input bind:value={arr[i].v} />
<p>{obj.deep['k e y']}{obj.deep['quo"te']}{arr[0].v}</p>
