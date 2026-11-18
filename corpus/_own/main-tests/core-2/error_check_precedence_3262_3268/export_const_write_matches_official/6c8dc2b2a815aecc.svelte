<script>
	const a = 1;
	export { a as b };
</script>
<button onclick={() => a = 2}>{a}</button>