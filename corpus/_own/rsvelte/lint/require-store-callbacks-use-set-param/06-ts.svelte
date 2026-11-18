<script lang="ts">
	import { writable, readable } from 'svelte/store';

	type Setter = (v: number) => void;

	const a = writable<number>(0, (set: Setter) => set(1));
	const b = readable<number>(0, (update: Setter) => update(2));
</script>

<p>{$a} {$b}</p>
