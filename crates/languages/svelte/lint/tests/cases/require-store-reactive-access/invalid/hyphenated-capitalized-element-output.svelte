<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
</script>

<Foo-bar prop={$store} />
