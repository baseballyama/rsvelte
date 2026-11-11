<script>
	let v = $state(1);
</script>

<b onclick={() => { let x = $state(1); v = x; }}>{v}</b>
