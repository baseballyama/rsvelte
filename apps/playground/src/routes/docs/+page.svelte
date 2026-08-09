<script lang="ts">
	import { base } from '$app/paths';
	import { GUIDE_LIST } from '$lib/docs';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import DocsShell from '$lib/components/DocsShell.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	const toc = [
		{ label: 'Choosing a package', href: '#choosing-a-package' },
		{ label: 'Migration', href: '#migration' },
		{ label: 'Runtime environments', href: '#runtime-environments' },
	];

	const migration = `- import { compile } from 'svelte/compiler';
+ import { compile } from '@rsvelte/compiler';`;
</script>

<svelte:head>
	<title>Overview · rsvelte</title>
	<meta
		name="description"
		content="An overview of the rsvelte compiler, formatter, type-checker, and Vite integration packages."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="docs" />

	<DocsShell current="overview" {toc}>
		<main class="article">
			<nav class="breadcrumbs" aria-label="Breadcrumb">
				<a href="{base}/">Documentation</a>
				<span aria-hidden="true">/</span>
				<span>Overview</span>
			</nav>

			<header class="article-head">
				<h1>Overview</h1>
				<p class="lead">
					rsvelte is split into packages that correspond to the standard Svelte development tools.
				</p>
			</header>

			<p>
				Start with the compiler or Vite plugin for application builds. The formatter,
				<code>svelte2tsx</code>, and <code>svelte-check</code> packages can be adopted separately.
			</p>

			<section id="choosing-a-package">
				<h2>Choosing a package</h2>
				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Tool</th>
								<th>Use it for</th>
								<th>Package</th>
							</tr>
						</thead>
						<tbody>
							{#each GUIDE_LIST as guide (guide.id)}
								<tr>
									<td><a href="{base}/docs/{guide.id}">{guide.title}</a></td>
									<td>{guide.useFor}</td>
									<td><code>{guide.pkg}</code></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section id="migration">
				<h2>Migration</h2>
				<p>
					The packages follow their upstream interfaces. In many cases migration is limited to the
					package name:
				</p>
				<CodeBlock code={migration} lang="diff" />
				<p>
					Read the package guide before switching a production project. It documents environment
					setup and any APIs that are specific to the rsvelte distribution.
				</p>
			</section>

			<section id="runtime-environments">
				<h2>Runtime environments</h2>
				<dl class="environment-list">
					<div>
						<dt>Node.js</dt>
						<dd>Native NAPI packages are used by the Vite plugin and command-line tools.</dd>
					</div>
					<div>
						<dt>Browser</dt>
						<dd>The compiler, formatter, linter, and svelte2tsx are available through WebAssembly.</dd>
					</div>
					<div>
						<dt>Native</dt>
						<dd>A stable C ABI is available for integrations outside the JavaScript ecosystem.</dd>
					</div>
				</dl>
			</section>

			<nav class="page-nav" aria-label="Documentation pages">
				<a href="{base}/">
					<span>Previous</span>
					<strong>← Introduction</strong>
				</a>
				<a href="{base}/docs/compiler">
					<span>Next</span>
					<strong>Compiler →</strong>
				</a>
			</nav>
		</main>
	</DocsShell>

	<SiteFooter />
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.article {
		grid-area: main;
		min-width: 0;
		padding: 3rem clamp(2rem, 5vw, 4rem) 5rem;
	}

	.breadcrumbs {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.4rem;
		font-size: 0.78rem;
		color: var(--ink-faint);
	}

	.breadcrumbs a {
		color: var(--ink-soft);
	}

	.breadcrumbs a:hover {
		color: var(--accent);
	}

	.article-head {
		padding-bottom: 1rem;
	}

	h1 {
		font-size: clamp(2.25rem, 5vw, 3.25rem);
		font-weight: 700;
		line-height: 1.12;
		letter-spacing: -0.035em;
	}

	.lead {
		margin-top: 0.8rem;
		font-size: 1.12rem;
		line-height: 1.65;
		color: var(--ink-soft);
	}

	.article > p,
	section > p {
		font-size: 0.98rem;
		line-height: 1.75;
		color: var(--ink-soft);
	}

	.article > p {
		margin-top: 0.75rem;
	}

	.article code {
		font-size: 0.84em;
	}

	section {
		padding-top: 2.5rem;
		scroll-margin-top: 5rem;
	}

	h2 {
		margin-bottom: 0.75rem;
		padding-bottom: 0.45rem;
		border-bottom: 1px solid var(--rule);
		font-size: 1.4rem;
		font-weight: 650;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	section :global(.block) {
		margin: 1rem 0;
	}

	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: 6px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
	}

	th,
	td {
		padding: 0.65rem 0.8rem;
		border-bottom: 1px solid var(--rule);
		text-align: left;
		vertical-align: top;
	}

	th {
		background: var(--paper);
		font-size: 0.75rem;
		font-weight: 650;
		color: var(--ink);
	}

	td {
		line-height: 1.5;
		color: var(--ink-soft);
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	td a {
		font-weight: 600;
		color: var(--accent);
	}

	.environment-list {
		border-top: 1px solid var(--rule);
	}

	.environment-list > div {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: 1.5rem;
		padding: 0.8rem 0;
		border-bottom: 1px solid var(--rule);
	}

	dt {
		font-size: 0.9rem;
		font-weight: 600;
	}

	dd {
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--ink-soft);
	}

	.page-nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		margin-top: 3.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--rule);
	}

	.page-nav a {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.page-nav a:last-child {
		align-items: flex-end;
	}

	.page-nav span {
		font-size: 0.72rem;
		color: var(--ink-faint);
	}

	.page-nav strong {
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--accent);
	}

	@media (max-width: 860px) {
		.article {
			padding-top: 2rem;
			padding-inline: clamp(1rem, 5vw, 2.5rem);
		}
	}
</style>
