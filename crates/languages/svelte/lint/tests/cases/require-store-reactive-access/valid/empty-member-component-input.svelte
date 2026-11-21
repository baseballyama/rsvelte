<script>
	import { writable } from 'svelte/store';
	import Foo from './Foo.svelte';
	let store = writable('hello');
</script>

<Foo. prop={store} />
