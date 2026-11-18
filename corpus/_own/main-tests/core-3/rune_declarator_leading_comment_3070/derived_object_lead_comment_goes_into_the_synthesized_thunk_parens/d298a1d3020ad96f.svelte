<script>
	let a = $state(0);
	let d = /* c */ $derived({ n: a });
</script>

<button onclick={() => a++}>{a}</button>{d.n}
