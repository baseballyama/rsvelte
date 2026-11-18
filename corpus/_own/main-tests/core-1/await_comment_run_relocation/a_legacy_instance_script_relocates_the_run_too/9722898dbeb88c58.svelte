<script>
	export let x = 1;
	async function f() {
		return (/* c */ await load())();
	}
</script>
<p>{x}{f}</p>