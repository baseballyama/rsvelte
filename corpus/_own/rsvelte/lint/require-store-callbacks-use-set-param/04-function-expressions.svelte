<script>
	import { readable, writable } from 'svelte/store';

	const a = readable(0, function start(stop) {
		return stop;
	});
	const b = writable(0, function (set) {
		set(1);
	});
	const c = readable(0, async (tick) => tick(1));
</script>

<p>{$a} {$b} {$c}</p>
