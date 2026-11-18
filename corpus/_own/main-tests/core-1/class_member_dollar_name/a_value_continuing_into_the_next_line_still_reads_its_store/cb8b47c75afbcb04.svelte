<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
	class P {
		a =
			$count;
		b = 1 +
			$count;
		c = [1][0] || $count;
		d = [$count][0];
	}
	let p = new P();
</script>
<p>{p.a}</p>