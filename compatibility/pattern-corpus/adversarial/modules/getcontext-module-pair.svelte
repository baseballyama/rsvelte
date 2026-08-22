<script module>
	const KEY = Symbol('k');
	export { KEY };
</script>

<script>
	import { setContext, getContext } from 'svelte';
	let { seed = 1 } = $props();
	setContext(KEY, () => seed * 2);
	const reader = getContext(KEY);
</script>

<p>{reader()}</p>
