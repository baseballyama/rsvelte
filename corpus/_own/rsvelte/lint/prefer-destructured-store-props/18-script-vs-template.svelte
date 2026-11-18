<script module>
	import { writable } from 'svelte/store';

	export const foo = writable({});
	// inside a script element the rule never fires
	const inModule = foo;
</script>

<script>
	// still inside a script element
	const alsoInScript = $foo.bar;
</script>

<p>{$foo.bar}</p>
<p>{alsoInScript}{inModule}</p>
