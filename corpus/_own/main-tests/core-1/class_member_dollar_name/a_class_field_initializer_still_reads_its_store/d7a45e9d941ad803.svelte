<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
	class C {
		x = $count;
		$abc() { return 1; }
	}
	let c = new C();
</script>
<p>{c.x}</p>