<script lang="ts">
	interface TocItem {
		label: string;
		href: string;
	}

	interface Props {
		items: TocItem[];
	}

	let { items }: Props = $props();
	let open = $state(false);
</script>

<aside class="toc">
	<button
		type="button"
		class="disclosure"
		aria-expanded={open}
		aria-controls="page-toc"
		onclick={() => (open = !open)}
	>
		<span>On this page</span>
		<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" class:flip={open}>
			<path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" />
		</svg>
	</button>

	<nav id="page-toc" class:open aria-label="On this page">
		<p>On this page</p>
		{#each items as item (item.href)}
			<a href={item.href} onclick={() => (open = false)}>{item.label}</a>
		{/each}
	</nav>
</aside>

<style>
	.toc {
		grid-area: toc;
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

	.disclosure {
		display: none;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--rule);
		border-radius: 6px;
		background: var(--paper);
		font-family: inherit;
		font-size: 0.86rem;
		font-weight: 600;
		color: var(--ink);
		cursor: pointer;
	}

	.disclosure svg {
		flex: none;
		transition: transform 0.15s ease;
	}

	.disclosure svg.flip {
		transform: rotate(180deg);
	}

	/* Below the three-column breakpoint the table of contents moves under the
	   article head, so the heading it duplicates is the disclosure label. */
	@media (max-width: 1120px) {
		.toc {
			padding: 1.5rem clamp(1rem, 5vw, 2.5rem) 0;
			border-left: 0;
		}

		.disclosure {
			display: flex;
		}

		nav {
			display: none;
			position: static;
			padding-top: 0.75rem;
		}

		nav.open {
			display: flex;
		}

		nav p {
			display: none;
		}

		nav a {
			padding: 0.3rem 0;
			font-size: 0.86rem;
		}
	}
</style>
