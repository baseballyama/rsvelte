<script>
	let v = $state('V');
</script>

{#await Promise.resolve(1)}<b>{v}</b>
