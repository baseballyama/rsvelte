<script>
	let { p, ...rest } = $props();
	let obj = $state({});
	let k = 'x';
	let arr = [];
	let s = $state(0);
	let t;
	function f() {
		rest.w = 1;
		rest.u++;
		let y = rest.r;
		[rest.d] = arr;
		({ e: rest.e } = obj);
		rest.a.b = 2;
		[rest.d2, s] = arr;
		({ e: rest.e2, s } = obj);
		[t, s] = rest.i;
		t = rest.j;
		return rest.q;
	}
</script>
<input type="checkbox" bind:checked={rest.c} />
<input type="checkbox" bind:group={rest.sel} value="v" />
<input bind:value={rest.a.b} />
<input bind:value={obj[rest.k]} />
<input bind:value={rest[k]} />
<input bind:value={rest.p} />
<div bind:this={rest.el}></div>
<div bind:clientWidth={rest.w2}></div>
{#each arr as item}<input bind:value={rest.each} />{/each}
<button onclick={() => (rest.click = 1)}>{rest.t}</button>
