<script lang="ts">
	// Compact site-wide footer. Kept identical across all pages.
</script>

<footer class="foot">
	<div class="inner">
		<div class="mark">
			<svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
				<path d="M19 8 13 18l-2-4 6-10 2 4Z" fill="var(--svelte)" />
				<path d="M5 16 11 6l2 4-6 10-2-4Z" fill="var(--rust)" />
			</svg>
			<span>rsvelte</span>
		</div>
		<div class="meta">
			<span>MIT licensed</span>
			<span class="sep">·</span>
			<span>Mirrors sveltejs/svelte@5.51.3</span>
			<span class="sep">·</span>
			<a href="https://github.com/baseballyama/rsvelte" target="_blank" rel="noopener">
				github.com/baseballyama/rsvelte
			</a>
		</div>
	</div>
</footer>

<style>
	.foot {
		border-top: 1px solid var(--rule);
		background: var(--paper);
	}

	.inner {
		max-width: 1080px;
		margin: 0 auto;
		padding: 1.4rem clamp(1rem, 4vw, 2.5rem);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.mark {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--ink);
	}

	.meta {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
		flex-wrap: wrap;
	}

	.meta .sep {
		opacity: 0.5;
	}

	.meta a {
		color: var(--ink-soft);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.meta a:hover {
		color: var(--svelte);
	}
</style>
