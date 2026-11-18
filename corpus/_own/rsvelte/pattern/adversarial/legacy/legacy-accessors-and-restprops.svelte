<svelte:options accessors={true} />

<script>
	export let value = 1;
	export let name = 'x';
	export const readonlyThing = 'r';

	let internal = 0;

	$: doubled = value * 2;
	$: if (value > 10) {
		internal = value;
	}

	function bump() {
		value += 1;
	}
</script>

<button on:click={bump}>{value} {doubled} {internal}</button>
<div {...$$restProps} data-name={name}>rest</div>
<p>{Object.keys($$props).length} {readonlyThing}</p>
