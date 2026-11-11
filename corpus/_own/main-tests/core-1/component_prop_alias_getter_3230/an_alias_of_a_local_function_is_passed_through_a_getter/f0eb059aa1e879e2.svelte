<script>
	import C from './C.svelte';
	const g = () => {};
	const h = g;
	const cb = h;
</script>

<C {cb} />
