<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { type Snippet, untrack } from 'svelte';

	interface Props {
		row?: Snippet<[number]>;
		meta?: ComponentProps<typeof import('svelte').SvelteComponent>;
	}

	let { row }: Props = $props();
	let n = $state(0);

	export type Exported = { n: number };

	function read(): number {
		return untrack(() => n);
	}
</script>

{#if row}{@render row(read())}{/if}
