<script module>
	export const KEY = Symbol('k');
	const url = import.meta.url;
	export function load() {
		return import('./nothing.js').catch(() => null);
	}
</script>

<script>
	import { onMount, tick } from 'svelte';
	import * as ns from 'svelte/store';
	import def, { writable as w, readable } from 'svelte/store';

	const store = w(1);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
		return () => {};
	});

	$effect(() => {
		void tick;
	});
</script>

<p>{String(KEY.description)} {url.length > 0} {typeof load}</p>
<p>{$store} {typeof ns.get} {typeof readable} {typeof def} {mounted}</p>
