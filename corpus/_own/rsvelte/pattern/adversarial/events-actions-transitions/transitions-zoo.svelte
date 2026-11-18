<script>
	import { fade, fly, crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	const [send, receive] = crossfade({ duration: 300 });

	let items = $state([{ id: 1 }, { id: 2 }]);
	let visible = $state(true);
	let dur = $state(200);

	function typewriter(node, { speed = 1 } = {}) {
		const text = node.textContent;
		return {
			duration: text.length / (speed * 0.01),
			tick: (t) => {
				node.textContent = text.slice(0, Math.trunc(text.length * t));
			},
		};
	}
</script>

{#if visible}
	<p transition:fade>plain</p>
	<p in:fly={{ y: 20, duration: dur, easing: quintOut }} out:fade|local>params</p>
	<p transition:typewriter={{ speed: 2 }}>custom</p>
	<p transition:fade|global>global</p>
{/if}

{#each items as item (item.id)}
	<div animate:flip={{ duration: dur }} in:receive={{ key: item.id }} out:send={{ key: item.id }}>
		{item.id}
	</div>
{/each}
