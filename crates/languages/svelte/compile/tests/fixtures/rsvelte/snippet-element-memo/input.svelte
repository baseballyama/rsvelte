<script>
	let o = $state({ t: 'A' });
	const f = (x) => x;
</script>
<span class="b {o.t.toLowerCase()}"></span>
<div>{#snippet s()}x{/snippet}<button class={f(o.t) ? 'c' : ''}>b</button></div>
