<script>
	import component from './foo'
	const style = { color: 'red' }
	let componentValue
	let metaData = {}
	function handleChange() {}
</script>

<svelte:component
	--style-props={style}
	bind:value={componentValue}
	on:changeValue={handleChange}
	bind:metaData
	this={component}
/>