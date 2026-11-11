<script>
	import { writable } from 'svelte/store';

	const 数 = writable(0);
</script>

<p>合計は{数}です</p>
