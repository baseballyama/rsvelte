<script>
	import { theme } from './t.js';
</script>
{#snippet s()}<b>{theme}</b>{/snippet}
<button>{@render s()}</button>
