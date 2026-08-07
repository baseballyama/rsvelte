<script lang="ts">
	interface TocItem {
		label: string;
		href: string;
	}

	interface Props {
		items: TocItem[];
	}

	let { items }: Props = $props();
</script>

<aside class="toc">
	<nav aria-label="On this page">
		<p>On this page</p>
		{#each items as item (item.href)}
			<a href={item.href}>{item.label}</a>
		{/each}
	</nav>
</aside>

<style>
	.toc {
		padding: 2rem 1rem 3rem 1.5rem;
		border-left: 1px solid var(--rule);
	}

	nav {
		position: sticky;
		top: 5rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	p {
		margin: 0 0 0.55rem;
		font-size: 0.75rem;
		font-weight: 650;
		color: var(--ink);
	}

	a {
		padding: 0.25rem 0;
		font-size: 0.78rem;
		line-height: 1.4;
		color: var(--ink-soft);
	}

	a:hover {
		color: var(--accent);
	}

	@media (max-width: 1120px) {
		.toc {
			display: none;
		}
	}
</style>
