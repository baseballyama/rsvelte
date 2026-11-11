<script>
	let a = $state(0);
	let o = /* c */ $state({ n: 0 });
</script>

<button onclick={() => a++}>{a}</button>{o.n}
