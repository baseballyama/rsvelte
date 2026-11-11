<script>
	import { theme } from './t.js';
	function go() { theme.x = 1; }
</script>
{#snippet s()}<b>x</b>{/snippet}
<button on:click={go}>{@render s()}</button>
