<script>
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	let on = $state(true);
	let node = $state(null);

	function act(el, params) {
		return { update(p) {}, destroy() {} };
	}

	const actions = { act };
	const dur = $derived(on ? 100 : 200);
</script>

<div use:act use:act={{ a: 1 }} use:actions.act={dur} class:on class:off={!on}></div>
<div transition:fade={{ duration: dur }}></div>
<div in:fade|global out:fade|local></div>
{#if on}
	{#each [1] as k (k)}
		<div animate:flip>{k}</div>
	{/each}
{/if}
<input bind:this={node} onkeydown={(e) => e.preventDefault()} />
<button onclick={() => (on = !on)}>{on}</button>
