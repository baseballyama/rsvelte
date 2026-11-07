<script>
	import { cubicOut } from 'svelte/easing';

	function whizz(node, { from, to }, params) {

		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
		delay: 0,
		duration: Math.sqrt(d) * 120,
		easing: cubicOut,
		tick: (t, u) =>
			Object.assign(node.style, {
				color: t > 0.5 ? 'Pink' : 'Blue'
			})
	};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
