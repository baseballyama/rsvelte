<script lang="ts">
	import { fade } from 'svelte/transition';
	export let value = '';
	export let el: HTMLElement | null = null;
	export let tag = 'div';
	let w = 0;
	function action(node: HTMLElement) {
		return { destroy() {} };
	}
</script>

<svelte:window bind:innerWidth={w} />
<input bind:value use:action transition:fade class:on={w > 0} />
<svelte:element this={tag} bind:this={el}>{w}</svelte:element>
