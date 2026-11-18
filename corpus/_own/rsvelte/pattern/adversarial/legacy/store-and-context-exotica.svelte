<script>
	import { getContext, hasContext, setContext, onMount, tick } from 'svelte';
	import { writable, derived, readonly, get } from 'svelte/store';

	const base = writable(1);
	const ro = readonly(base);
	const combo = derived([base, ro], ([$b, $r], set) => {
		set($b + $r);
		return () => {};
	});

	setContext('k', base);
	const from_ctx = hasContext('k') ? getContext('k') : base;

	$: doubled = $base * 2;
	$: base.update((n) => (n > 10 ? 10 : n));

	onMount(async () => {
		await tick();
		$base = get(base) + 1;
	});
</script>

<button onclick={() => ($base += 1)}>{$base}</button>
<p>{$ro} {$combo} {doubled} {$from_ctx}</p>
