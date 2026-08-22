<script>
	import { writable } from 'svelte/store';

	const foo = writable({ bar: 1 });
	let obj = $state({ n: 1 });
</script>

<p>{$state.snapshot(obj).n}</p>
<p>{$foo.bar}</p>
