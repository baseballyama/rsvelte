<script>
	let obj = $state({ v: '', arr: [''], nested: { deep: '' } });
	let list = $state(['a', 'b']);
	let idx = $state(0);
	let el = $state(null);
	let els = $state([]);

	function get() { return obj.v; }
	function set(v) { obj.v = v; }
</script>

<input bind:value={obj.v} />
<input bind:value={obj.nested.deep} />
<input bind:value={obj.arr[0]} />
<input bind:value={list[idx]} />
<input bind:value={list[idx + 1]} />
<input bind:value={obj['v']} />
<input bind:value={get, set} />
<input bind:this={el} />
{#each list as _, i}
	<input bind:this={els[i]} />
{/each}
<p>{obj.v}{obj.nested.deep}{obj.arr[0]}{list[idx]}{el ? 1 : 0}{els.length}</p>
