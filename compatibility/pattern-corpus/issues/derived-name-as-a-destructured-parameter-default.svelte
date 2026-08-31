<script>
	import { writable } from 'svelte/store';

	let base = $state(1);
	let v = $derived(base);
	let list = $derived([base]);
	const y = writable(1);

	function object_default({ v } = { v: 0 }) {
		return v;
	}

	function array_default([list] = [0]) {
		return list;
	}

	function second_param(a, { v } = { v: 0 }) {
		return a + v;
	}

	function store_default({ $y } = { $y: 0 }) {
		return $y;
	}

	const arrow_default = ({ v } = { v: 0 }) => v;

	class Host {
		method({ v } = { v: 0 }) {
			return v;
		}
	}

	function real_assignment(o) {
		({ v: base } = o);
		return base;
	}
</script>

<button
	onclick={() =>
		console.log(
			object_default(),
			array_default(),
			second_param(1),
			store_default(),
			arrow_default(),
			new Host().method(),
			real_assignment({ v: 9 })
		)}
></button>
{v}
{list.length}
{$y}
