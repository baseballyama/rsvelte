<script>
	import { writable } from 'svelte/store';

	const foo = writable({ bar: 1, baz: 2 });
	$: x = $foo.bar;
</script>

<p>{$foo.bar}</p>
<p>{x}</p>
<p>{$foo.baz + 1}</p>
