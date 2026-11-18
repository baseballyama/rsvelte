<script>
	import { writable } from 'svelte/store';

	const foo = writable({});
	const key = 'a';
	const idx = 0;
</script>

<p>{$foo[key]}</p>
<p>{$foo['lit']}</p>
<p>{$foo[key +
		idx]}</p>
