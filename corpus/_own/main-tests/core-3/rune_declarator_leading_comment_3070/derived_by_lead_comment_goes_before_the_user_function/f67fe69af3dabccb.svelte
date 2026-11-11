<script>
	let a = $state(0);
	let d = /* c */ $derived.by(() => a * 2);
</script>

<button onclick={() => a++}>{a}</button>{d}
