<script lang="ts">
	import { $getSelection as getSelection } from 'lexical';
	import { navigating } from './stores.js';
	import { app$ } from './stores.js';
	import type { LayoutData } from './$types.js';

	let { color = 'red' }: { color?: string } = $props();

	const types = getSelection();
	const path = 'a/$types';
	const label = `v=${types}`;
	const app = $app$;
	let data: LayoutData | null = null;
</script>

{#if !!$navigating}
	<p>{types}{path}{label}{app}{color}{data}</p>
{/if}

<style lang="scss">
	@mixin color-styles($color) {
		color: $color;
	}
	p {
		@include color-styles(red);
	}
</style>
