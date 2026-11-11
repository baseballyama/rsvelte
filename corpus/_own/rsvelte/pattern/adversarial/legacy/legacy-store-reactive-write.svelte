<script>
	import { writable, get } from 'svelte/store';

	export let seed = 0;

	const count = writable(0);
	const label = writable('');

	$: $count = seed * 2;
	$: $label = `count is ${$count}`;
	$: peeked = get(count);
</script>

<p>{$label}:{peeked}</p>
