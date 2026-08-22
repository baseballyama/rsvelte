<script>
	import { setContext, getContext, hasContext, getAllContexts } from 'svelte';
	import { onMount, onDestroy, tick, untrack } from 'svelte';

	const KEY = Symbol('theme');
	setContext(KEY, { dark: true });
	setContext('plain', 1);

	const theme = getContext(KEY);
	const all = getAllContexts();

	let mounted = $state(false);

	onMount(async () => {
		await tick();
		mounted = untrack(() => hasContext('plain'));
		return () => {};
	});

	onDestroy(() => {
		console.log(all.size);
	});
</script>

<p>{theme.dark}:{mounted}</p>
