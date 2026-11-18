<script>
	/* eslint svelte/no-inline-styles: ["warn", { "allowTransitions": false }] */
	import { fade } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	let show = true;
	void flip;
</script>

{#if show}
	<div transition:fade|global>transition with modifier</div>
	<div animate:flip>animation kind is not Transition</div>
	<div use:noop>action kind is not Transition</div>
{/if}

<script context="module">
	export function noop() {}
</script>
