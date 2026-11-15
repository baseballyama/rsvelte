<script lang="ts">
	import type { Readable } from 'svelte/store';

	let count = 1;
	let later: Readable<number>;
	const doubled = $count * 2;
</script>

<p>{$count} {doubled} {$later}</p>
