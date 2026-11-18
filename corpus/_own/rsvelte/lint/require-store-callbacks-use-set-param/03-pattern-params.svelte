<script>
	import { writable, readable } from 'svelte/store';

	const noop = () => {};
	const a = writable(0, ({ set }) => set(1));
	const b = writable(0, ([set]) => set(1));
	const c = readable(0, (set = noop) => set);
	const d = readable(0, (...args) => args[0](1));
	const e = writable(0, (set, update) => update(set));
</script>

<p>{$a} {$b} {$c} {$d} {$e}</p>
