<script>
	import Child from './Child.svelte';
	// a comment the converter has to place
	export let value = 1;
	let doubled = value * 2;
	function bump() {
		value += 1;
	}
</script>
<button onclick={bump}>{doubled}</button>
<Child {value} />
