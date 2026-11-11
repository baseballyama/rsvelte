<script>
	let v = $state(1);
</script>

<b onclick={() => { let x = $derived(v); v = x; }}>{v}</b>
