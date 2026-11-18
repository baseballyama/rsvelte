<script>
	import { writable } from 'svelte/store';

	const 数 = /* ✅ */ writable(0, (更新) => 更新(1));
</script>

<p>{$数}</p>
