<script>
	import { writable } from 'svelte/store';

	const s = writable('<b>x</b>');
</script>

{@html s}
{@debug s}
