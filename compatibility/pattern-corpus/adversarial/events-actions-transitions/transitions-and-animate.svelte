<script>
	import { flip } from 'svelte/animate';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let items = $state([{ id: 1 }, { id: 2 }]);
	let show = $state(true);

	function spin(node, { duration = 100 } = {}) {
		return {
			duration,
			css: (t, u) => `opacity:${t};transform:rotate(${u * 360}deg)`,
			tick: (t) => void (node.style.zIndex = String(Math.round(t)))
		};
	}
</script>

{#each items as item (item.id)}
	<li animate:flip={{ duration: 200, easing: cubicOut }} in:fly|global={{ y: 8 }} out:fade|local>
		{item.id}
	</li>
{/each}

{#if show}
	<p transition:spin={{ duration: 50 }}>x</p>
{/if}

<button onclick={() => { show = !show; items = items.toReversed(); }}>go</button>
