<script>
	import { writable, readable } from 'svelte/store';

	const a = writable(0, ({ set }) => set(1));
	const b = readable(0, ([set]) => set(1));
	const c = writable(0, (...rest) => rest);
	const d = readable(0, (set = () => {}) => set());
	const e = writable(0, (start) => start());
	const f = readable(0, () => {});
	const g = writable(...[0], (start) => start());
</script>

<p>{a}{b}{c}{d}{e}{f}{g}</p>
