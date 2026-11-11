<script>
	import { writable } from 'svelte/store';
	const store = writable({});
	export let f = () => ($store.x);
</script>
{f}
