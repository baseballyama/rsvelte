<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { TestResults } from '$lib/types/test-results';
	import { GUIDE_LIST } from '$lib/docs';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import DocsShell from '$lib/components/DocsShell.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteNav from '$lib/components/SiteNav.svelte';

	let tests = $state<TestResults | null>(null);

	onMount(async () => {
		try {
			const response = await fetch(`${base}/test-results.json`);
			tests = response.ok ? await response.json() : null;
		} catch {
			tests = null;
		}
	});

	const inScopeTests = $derived(tests ? tests.summary.total - tests.summary.skipped : null);
	const toc = [
		{ label: 'Installation', href: '#installation' },
		{ label: 'Using the compiler', href: '#using-the-compiler' },
		{ label: 'Packages', href: '#packages' },
		{ label: 'Project status', href: '#project-status' },
	];

	const usage = `import { compile } from '@rsvelte/compiler';

const result = compile(source, {
  filename: 'App.svelte',
  generate: 'client'
});`;
</script>

<svelte:head>
	<title>Introduction · rsvelte</title>
	<meta
		name="description"
		content="Get started with rsvelte, a Rust implementation of the Svelte compiler and developer tooling."
	/>
</svelte:head>

<div class="page">
	<SiteNav active="docs" />

	<DocsShell current="introduction" {toc}>
		<main class="article">
			<nav class="breadcrumbs" aria-label="Breadcrumb">
				<span>Documentation</span>
				<span aria-hidden="true">/</span>
				<span>Introduction</span>
			</nav>

			<header class="article-head">
				<h1>Introduction</h1>
				<p class="lead">
					rsvelte is a Rust implementation of the Svelte compiler and related developer tooling.
				</p>
			</header>

			<p>
				The project follows the official Svelte compiler implementation and aims to provide
				compatible APIs and output. You can use the compiler from Node.js, WebAssembly, or native
				bindings, and adopt the supporting tools independently.
			</p>

			<aside class="callout">
				<strong>Compatibility target</strong>
				<p>
					rsvelte is tested against the upstream <code>sveltejs/svelte</code> fixture suite. See the
					<a href="{base}/progress">compatibility report</a> for the current results.
				</p>
			</aside>

			<section id="installation">
				<h2>Installation</h2>
				<p>Install the compiler package with your package manager:</p>
				<CodeBlock code="pnpm add @rsvelte/compiler" lang="bash" />
				<p>
					Other rsvelte packages can be installed separately. They do not require migrating the
					entire toolchain at once.
				</p>
			</section>

			<section id="using-the-compiler">
				<h2>Using the compiler</h2>
				<p>
					The compiler package exposes the familiar Svelte compiler interface. Change the import and
					keep the existing compile options:
				</p>
				<CodeBlock code={usage} lang="js" />
				<p>
					For browser use, initialize the WebAssembly module before the first compiler call. The
					<a href="{base}/docs/compiler">compiler guide</a> covers both environments.
				</p>
			</section>

			<section id="packages">
				<h2>Packages</h2>
				<p>The shipped packages cover the compiler and the common Svelte development workflow.</p>

				<div class="table-wrap">
					<table>
						<thead>
							<tr>
								<th>Package</th>
								<th>Replaces</th>
								<th>Browser</th>
							</tr>
						</thead>
						<tbody>
							{#each GUIDE_LIST as guide (guide.id)}
								<tr>
									<td>
										<a href="{base}/docs/{guide.id}">{guide.title}</a>
										<code>{guide.pkg}</code>
									</td>
									<td><code>{guide.dropInFor}</code></td>
									<td>{guide.runnable ? 'Yes' : 'CLI only'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section id="project-status">
				<h2>Project status</h2>
				<p>
					{#if tests && inScopeTests !== null}
						The current report has {tests.summary.passed.toLocaleString('en-US')} of {inScopeTests.toLocaleString(
							'en-US',
						)} in-scope fixtures passing ({tests.summary.percentage.toFixed(1)}%).
					{:else}
						Compatibility results are generated from the official Svelte test suite.
					{/if}
				</p>
				<ul>
					<li><a href="{base}/progress">Review compatibility by test category</a></li>
					<li><a href="{base}/benchmark">Review compiler and toolchain benchmarks</a></li>
					<li><a href="{base}/playground">Try browser-compatible packages</a></li>
				</ul>
			</section>

			<nav class="page-nav" aria-label="Documentation pages">
				<span></span>
				<a href="{base}/docs">
					<span>Next</span>
					<strong>Overview →</strong>
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

	.breadcrumbs span:last-child {
		color: var(--ink-soft);
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

	.article a,
	section a {
		color: var(--accent);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.article code {
		font-size: 0.84em;
	}

	.callout {
		margin-top: 1.5rem;
		padding: 1rem 1.1rem;
		border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--rule));
		border-left: 3px solid var(--accent);
		border-radius: 5px;
		background: color-mix(in srgb, var(--accent) 5%, var(--bg));
	}

	.callout strong {
		font-size: 0.88rem;
	}

	.callout p {
		margin-top: 0.3rem;
		font-size: 0.88rem;
		line-height: 1.6;
		color: var(--ink-soft);
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
		margin-top: 1rem;
		overflow-x: auto;
		border: 1px solid var(--rule);
		border-radius: 6px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.84rem;
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
		color: var(--ink-soft);
	}

	tbody tr:last-child td {
		border-bottom: 0;
	}

	td:first-child a {
		display: block;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
	}

	td:first-child a:hover {
		color: var(--accent);
	}

	td:first-child code {
		display: block;
		margin-top: 0.2rem;
		color: var(--ink-faint);
	}

	ul {
		margin: 0.75rem 0 0;
		padding-left: 1.25rem;
	}

	li {
		padding: 0.2rem 0;
		font-size: 0.94rem;
		color: var(--ink-soft);
	}

	.page-nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin-top: 3.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--rule);
	}

	.page-nav a {
		justify-self: end;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		text-decoration: none;
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
