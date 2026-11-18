<script>
	export let field;
	let selectId = 'a';

	function reset() {
		field.attributes = {};
	}
</script>

<button onclick={reset}>reset</button>

<select id={selectId} bind:value={field.attributes.position}>
	<option value="top">top</option>
</select>
