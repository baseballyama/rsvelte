<script lang="ts">
	import type { Snippet } from 'svelte';
	import DocsSidebar from '$lib/components/DocsSidebar.svelte';
	import DocsToc from '$lib/components/DocsToc.svelte';

	interface Props {
		/** Sidebar entry to mark as current. */
		current: string;
		toc: { label: string; href: string }[];
		children: Snippet;
	}

	let { current, toc, children }: Props = $props();
</script>

<div class="docs-shell">
	<DocsSidebar {current} />
	{@render children()}
	<DocsToc items={toc} />
</div>

<style>
	/* Placement is by area name, so the DOM order (nav, article, toc) can stay
	   the reading order while the narrow layouts move the two navs around it. */
	.docs-shell {
		flex: 1;
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 230px minmax(0, 52rem) 200px;
		grid-template-areas: 'nav main toc';
		justify-content: center;
	}

	@media (max-width: 1120px) {
		.docs-shell {
			grid-template-columns: 230px minmax(0, 1fr);
			grid-template-areas:
				'nav toc'
				'nav main';
		}
	}

	@media (max-width: 860px) {
		.docs-shell {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas:
				'nav'
				'toc'
				'main';
		}
	}
</style>
