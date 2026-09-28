<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		header: Snippet;
		content: Snippet;
		footer: Snippet;
	};
	let { header, content, footer }: Props = $props();
</script>

<main class="bg-background text-foreground flex h-screen flex-col">
	{@render header()}
	{@render content()}
	{@render footer()}
</main>
