<script>
	import Widget from './Widget.svelte';

	let w;

	function go() {
		w.remove();
	}
</script>

<Widget bind:this={w} />
<button on:click={go}>x</button>
