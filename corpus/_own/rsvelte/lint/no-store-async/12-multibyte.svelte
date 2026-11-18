<script>
	import { writable } from 'svelte/store';

	const 店舗 = /* 🏪🏪 */ writable(0, async (set) => set(1));
</script>

<p>{$店舗}</p>
