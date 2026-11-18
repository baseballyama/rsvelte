<script>
	import { writable } from 'svelte/store';

	const foo = writable({});
</script>

<p>{$foo?.bar}</p>
<p>{$foo?.['bar']}</p>
<p>{$foo[`bar`]}</p>
<p>{$foo['a' + 'b']}</p>
<p>{$foo[
		'multi'
	]}</p>
<p>{$$props?.bar}</p>
