<script>
	let v = $state(1);
</script>

<b onclick={() => { let x = $state(1); x = 2; }}>{v}</b>
