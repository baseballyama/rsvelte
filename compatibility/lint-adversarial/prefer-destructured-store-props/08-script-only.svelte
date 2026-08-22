<script>
	import { writable } from 'svelte/store';

	const foo = writable({});
	$: val = $foo.bar;
	const also = $foo.baz;
</script>

<p>{val} {also}</p>
