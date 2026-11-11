<script>
	import { writable } from 'svelte/store';

	// writable(0, async () => {}) in a comment
	const tpl = `writable(0, async (set) => set(1))`;
	const str = 'writable(0, async () => {})';
	const re = /writable\(0, async \(\) => \{\}\)/;
	const real = writable(0, async (set) => set(1));
</script>

<p>{tpl} {str} {re.source} {$real}</p>
