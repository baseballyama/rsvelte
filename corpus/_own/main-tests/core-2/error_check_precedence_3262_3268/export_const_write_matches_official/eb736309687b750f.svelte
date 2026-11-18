<script>
	let a = $state(1);
	export { a };
</script>
<button onclick={() => a = 2}>{a}</button>