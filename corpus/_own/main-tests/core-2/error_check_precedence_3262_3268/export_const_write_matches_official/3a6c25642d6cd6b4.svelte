<script>
	const a = 1;
	export { a as b };
</script>
<input bind:value={a} />
{a}