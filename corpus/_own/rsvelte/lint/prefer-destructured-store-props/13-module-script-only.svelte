<script module>
	import { writable } from 'svelte/store';

	export const foo = writable({ bar: 1 });
</script>

<p>{$foo.bar}</p>
