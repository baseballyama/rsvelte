<script lang="ts">
	import { base } from '$app/paths';
	import type { Guide } from '$lib/docs';
	import SiteNav from '$lib/components/SiteNav.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import Eyebrow from '$lib/components/Eyebrow.svelte';

	interface Props {
		guide: Guide;
	}

	let { guide }: Props = $props();
</script>

<div class="page">
	<SiteNav active="docs" />

	<main class="wrap">
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href="{base}/docs">Docs</a>
			<span aria-hidden="true">/</span>
			<span class="here">{guide.title}</span>
		</nav>

		<header class="head">
			<Eyebrow gap="0.6rem" fontSize="0.72rem" letterSpacing="0.06em" ruleWidth="20px" uppercase={false}
				>{guide.pkg}</Eyebrow
			>
			<h1 class="title">{guide.title}</h1>
			<p class="dropin">drop-in for <code>{guide.dropInFor}</code></p>
			<p class="tagline">{guide.tagline}</p>

			<div class="actions">
				{#if guide.runnable}
					<a class="btn primary" href="{base}/playground?tool={guide.id}">Open in playground →</a>
				{:else}
					<span class="btn disabled" title="This tool can't run in a browser">
						Not runnable in browser
					</span>
				{/if}
			</div>

			<div class="install">
				<CodeBlock code={guide.install} lang="bash" caption="install" />
			</div>
		</header>

		<div class="sections">
			{#each guide.sections as section (section.title)}
				<section class="sec">
					<h2 class="sec-title">{section.title}</h2>

					{#if section.body}
						{#each section.body as p (p)}
							<p class="prose">{p}</p>
						{/each}
					{/if}

					{#if section.list}
						<ul class="bullets">
							{#each section.list as item (item)}
								<li>{item}</li>
							{/each}
						</ul>
					{/if}

					{#if section.code}
						<div class="code">
							<CodeBlock
								code={section.code.code}
								lang={section.code.lang}
								caption={section.code.caption}
							/>
						</div>
					{/if}

					{#if section.table}
						<div class="table-wrap">
							<table>
								<thead>
									<tr>
										{#each section.table.head as h (h)}
											<th>{h}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each section.table.rows as row, i (i)}
										<tr>
											{#each row as cell, j (j)}
												{#if j === 0}
													<td><code>{cell}</code></td>
												{:else}
													<td>{cell}</td>
												{/if}
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</section>
			{/each}
		</div>
	</main>

	<SiteFooter />
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.wrap {
		flex: 1;
		width: 100%;
		max-width: 56rem;
		margin: 0 auto;
		padding: clamp(1.4rem, 3vh, 2.2rem) clamp(1rem, 4vw, 2rem) 3rem;
	}

	.crumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.72rem;
		color: var(--ink-faint);
		margin-bottom: 1.4rem;
	}

	.crumbs a {
		color: var(--ink-soft);
		border-bottom: 1px solid transparent;
	}

	.crumbs a:hover {
		color: var(--ink);
		border-bottom-color: var(--ink);
	}

	.crumbs .here {
		color: var(--ink);
	}

	.title {
		font-weight: 800;
		font-size: clamp(1.8rem, 4vw, 2.6rem);
		letter-spacing: -0.025em;
		color: var(--ink);
		margin: 0.5rem 0 0.3rem;
	}

	.dropin {
		font-size: 0.9rem;
		color: var(--ink-soft);
		margin: 0 0 0.8rem;
	}

	.dropin code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.82rem;
		color: var(--ink);
		background: var(--paper-2);
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
	}

	.tagline {
		font-size: 1.02rem;
		line-height: 1.65;
		color: var(--ink-soft);
		max-width: 42rem;
		margin: 0 0 1.2rem;
	}

	.actions {
		display: flex;
		gap: 0.6rem;
		margin-bottom: 1rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		font-size: 0.88rem;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		border: 1px solid transparent;
	}

	.btn.primary {
		background: var(--svelte);
		color: #fff;
	}

	.btn.primary:hover {
		background: var(--svelte-hover);
	}

	.btn.disabled {
		background: var(--paper-2);
		color: var(--ink-faint);
		cursor: not-allowed;
	}

	.install {
		max-width: 32rem;
	}

	.sections {
		margin-top: 2.4rem;
		display: flex;
		flex-direction: column;
		gap: 2.2rem;
	}

	.sec-title {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--ink);
		margin: 0 0 0.7rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid var(--rule);
	}

	.prose {
		font-size: 0.95rem;
		line-height: 1.7;
		color: var(--ink-soft);
		margin: 0 0 0.7rem;
	}

	.prose:last-child {
		margin-bottom: 0;
	}

	.bullets {
		margin: 0.2rem 0 0.4rem;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.bullets li {
		font-size: 0.93rem;
		line-height: 1.6;
		color: var(--ink-soft);
	}

	.code {
		margin-top: 0.8rem;
	}

	.table-wrap {
		margin-top: 0.8rem;
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: 6px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.86rem;
	}

	th,
	td {
		text-align: left;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid var(--rule);
	}

	th {
		font-weight: 600;
		color: var(--ink);
		background: var(--paper);
		font-size: 0.76rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	td {
		color: var(--ink-soft);
		vertical-align: top;
	}

	td code {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		color: var(--ink);
	}
</style>
