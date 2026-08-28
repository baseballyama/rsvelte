<script>
	import { writable } from 'svelte/store';

	let value = writable({ qux: 4 });

	$value = {
		one: writable(
			$value = {
				two: ({ $value } = { $value: { fred: $value.qux } }) // dropped after the unlocated IIFE body
			} // dropped while the cursor remains exhausted
		) // dropped while the cursor remains exhausted
	};
</script>

{JSON.stringify($value)}
