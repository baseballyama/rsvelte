<script lang="ts">
	import { base } from '$app/paths';
</script>

<footer class="footer">
	<div class="inner">
		<p>rsvelte is an independent Rust port of the Svelte compiler and toolchain.</p>
		<nav aria-label="Footer navigation">
			<a href="{base}/docs">Docs</a>
			<a href="{base}/playground">Playground</a>
			<a href="{base}/progress">Compatibility</a>
			<a href="https://github.com/baseballyama/rsvelte" target="_blank" rel="noopener">GitHub</a>
		</nav>
	</div>
</footer>

<style>
	.footer {
		border-top: 1px solid var(--rule);
		background: var(--paper);
	}

	.inner {
		max-width: 1120px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	p {
		font-size: 0.82rem;
		color: var(--ink-soft);
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
	}

	a {
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--ink-soft);
	}

	a:hover {
		color: var(--accent);
	}

	@media (max-width: 700px) {
		.inner {
			align-items: flex-start;
			flex-direction: column;
			gap: 1rem;
			padding-inline: 1rem;
		}
	}
</style>
