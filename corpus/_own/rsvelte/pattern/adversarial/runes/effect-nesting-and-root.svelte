<script>
	import { untrack } from 'svelte';

	let n = $state(0);
	let on = $state(true);
	let log = $state([]);

	$effect(() => {
		if (!on) return;
		const id = n;
		return () => {
			log.push(id);
		};
	});

	$effect(() => {
		untrack(() => n);
		$effect.pre(() => {
			void n;
		});
	});

	const stop = $effect.root(() => {
		$effect(() => {
			void n;
		});
		return () => {};
	});

	$effect(() => {
		if ($effect.tracking()) {
			void n;
		}
	});
</script>

<button onclick={() => n++}>{n} {on} {log.length} {typeof stop}</button>
