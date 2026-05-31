<script lang="ts">
	import { type EcoComponent, statusLabel } from '$lib/ecosystem';

	interface Props {
		c: EcoComponent;
		/** Compact cards drop the install row + blurb wraps tighter (home grid). */
		compact?: boolean;
	}

	let { c, compact = false }: Props = $props();
</script>

<article class="card status-{c.status}" class:compact>
	<header class="card-head">
		<span class="badge">
			<span class="dot"></span>
			{statusLabel(c.status)}
		</span>
		{#if c.speedup}
			<span class="speed" title="multi-threaded rsvelte vs. the official JS tool">
				{c.speedup.x}×<span class="speed-of">faster</span>
			</span>
		{/if}
	</header>

	<h3 class="name">{c.name}</h3>

	<p class="dropin">
		{#if c.status === 'delegated'}
			instead of
		{:else}
			drop-in for
		{/if}
		<a href={c.originalUrl} target="_blank" rel="noopener" class="orig">
			{c.dropInFor}<span class="ext" aria-hidden="true">↗</span>
		</a>
		{#if c.routesTo}
			<span class="routes">
				→ <a href={c.routesTo.url} target="_blank" rel="noopener">{c.routesTo.label}</a>
			</span>
		{/if}
	</p>

	<p class="blurb">{c.blurb}</p>

	<footer class="card-foot">
		{#if c.note}
			<span class="note">{c.note}</span>
		{/if}
		{#if !compact && (c.install || c.pkgUrl)}
			<div class="actions">
				{#if c.install}
					<code class="install">{c.install}</code>
				{/if}
				{#if c.pkgUrl}
					<a href={c.pkgUrl} target="_blank" rel="noopener" class="src">
						source <span class="ext" aria-hidden="true">↗</span>
					</a>
				{/if}
			</div>
		{/if}
	</footer>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		background: var(--bg);
		border: 1px solid var(--rule);
		border-radius: 6px;
		padding: 1.25rem 1.35rem 1.35rem;
		height: 100%;
		transition: border-color 0.18s ease;
	}

	.card.status-shipped:hover {
		border-color: color-mix(in srgb, var(--svelte) 45%, var(--rule));
	}

	.card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-family: 'Fira Mono', monospace;
		font-size: 0.64rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: var(--ink-faint);
	}

	.status-shipped .dot {
		background: var(--ok);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 18%, transparent);
	}

	.status-planned .dot {
		background: var(--warn);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--warn) 18%, transparent);
	}

	.status-delegated .dot {
		background: var(--ink-faint);
	}

	.speed {
		display: inline-flex;
		align-items: baseline;
		gap: 0.3rem;
		font-family: 'Overpass', sans-serif;
		font-weight: 800;
		/* >=18.66px bold clears the WCAG large-text bar, so the Svelte-orange
		   number stays AA-legible on the light card background. */
		font-size: 1.25rem;
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--svelte);
		font-variant-numeric: tabular-nums;
	}

	.speed-of {
		font-family: 'Fira Mono', monospace;
		font-weight: 500;
		font-size: 0.6rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}

	.name {
		font-family: 'Fira Mono', monospace;
		font-weight: 500;
		font-size: 1.02rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		margin: 0;
		word-break: break-word;
	}

	.dropin {
		font-size: 0.84rem;
		color: var(--ink-soft);
		margin: 0;
	}

	.orig {
		color: var(--svelte);
		font-family: 'Fira Mono', monospace;
		font-size: 0.92em;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	.orig:hover {
		color: var(--svelte-hover);
	}

	.ext {
		font-size: 0.85em;
		opacity: 0.6;
		margin-left: 0.1em;
		text-decoration: none;
		display: inline-block;
	}

	.routes {
		color: var(--ink-faint);
		font-family: 'Fira Mono', monospace;
		font-size: 0.82em;
	}

	.routes a {
		color: var(--rust);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	.blurb {
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--ink-soft);
		margin: 0;
		flex: 1;
	}

	.compact .blurb {
		font-size: 0.86rem;
	}

	.card-foot {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		margin-top: 0.15rem;
		padding-top: 0.8rem;
		border-top: 1px solid var(--rule);
	}

	.note {
		font-family: 'Fira Mono', monospace;
		font-size: 0.68rem;
		letter-spacing: 0.01em;
		color: var(--ink-faint);
		line-height: 1.4;
	}

	.actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.install {
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink);
		background: var(--paper);
		border: 1px solid var(--rule);
		border-radius: 4px;
		padding: 0.3rem 0.55rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.src {
		font-family: 'Fira Mono', monospace;
		font-size: 0.74rem;
		color: var(--ink-soft);
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		white-space: nowrap;
		transition: color 0.18s ease;
	}

	.src:hover {
		color: var(--ink);
	}
</style>
