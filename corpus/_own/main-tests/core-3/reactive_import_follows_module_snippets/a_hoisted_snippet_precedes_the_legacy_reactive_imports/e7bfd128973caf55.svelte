<script>
	import { theme } from './t.js';
	import { chords } from './c.js';
	function go() { theme.x = 1; chords.y = 2; }
</script>
{#snippet s()}<b>x</b>{/snippet}
<button on:click={go}>{@render s()}</button>
