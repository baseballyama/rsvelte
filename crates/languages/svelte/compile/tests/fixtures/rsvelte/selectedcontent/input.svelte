<script>
	let { value, items } = $props();
</script>
<select bind:value>
	<button dir="auto"><selectedcontent></selectedcontent></button>
	{#each items as item}
		<option value={item}><span>{item}</span></option>
	{/each}
</select>
<select>
	<button><b>pick</b><selectedcontent></selectedcontent></button>
	<option>one</option>
</select>
