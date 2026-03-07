<script lang="ts">
	import type { PageData } from './$types';
	import ProgressRing from '$lib/components/ProgressRing.svelte';
	import CategoryCard from '$lib/components/CategoryCard.svelte';
	import TestList from '$lib/components/TestList.svelte';

	let { data }: { data: PageData } = $props();

	let selectedCategoryId = $state<string | null>(null);

	const toggleCategory = (categoryId: string) => {
		if (selectedCategoryId === categoryId) {
			selectedCategoryId = null;
		} else {
			selectedCategoryId = categoryId;
		}
	};

	const formatDate = (isoString: string): string => {
		const date = new Date(isoString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};
</script>

<svelte:head>
	<title>Test Progress - Svelte Compiler Rust</title>
</svelte:head>

<div class="container">
	<header class="header">
		<nav class="nav">
			<a href="/" class="logo">Svelte Compiler Rust</a>
			<div class="nav-links">
				<a href="/">Home</a>
				<a href="/playground">Playground</a>
				<a href="/progress" class="active">Progress</a>
				<a href="/benchmark">Benchmark</a>
				<a
					href="https://github.com/baseballyama/svelte-compiler-rust"
					target="_blank"
					rel="noopener"
				>
					GitHub
				</a>
			</div>
		</nav>
	</header>

	<main class="main">
		{#if data.error}
			<div class="error-container">
				<h1>Test Results Not Available</h1>
				<p class="error-message">{data.error}</p>
				<div class="code-block">
					<code>
						cargo run --release --bin test_reporter -- --output docs/static/test-results.json
					</code>
				</div>
			</div>
		{:else if data.results}
			<div class="dashboard">
				<div class="title-section">
					<h1>Test Progress Dashboard</h1>
					<p class="meta">
						Last updated: {formatDate(data.results.generated_at)} | Commit: {data.results
							.commit_sha}
					</p>
				</div>

				<div class="overall-section">
					<div class="overall-card">
						<ProgressRing
							percentage={data.results.summary.percentage}
							size={120}
							strokeWidth={10}
							color={data.results.summary.percentage >= 90
								? '#27ca40'
								: data.results.summary.percentage >= 50
									? '#ffbd2e'
									: '#ff5f56'}
						/>
						<div class="overall-info">
							<h2>Overall Progress</h2>
							<p class="overall-stats">
								<span class="passed">{data.results.summary.passed}</span>
								<span class="separator">/</span>
								<span class="total"
									>{data.results.summary.total - data.results.summary.skipped}</span
								>
								tests passing
							</p>
							{#if data.results.summary.skipped > 0}
								<p class="skipped-info">{data.results.summary.skipped} tests skipped</p>
							{/if}
						</div>
					</div>
				</div>

				<section class="categories-section">
					<h2>Categories</h2>
					<p class="section-hint">Click a category to filter the test list below</p>
					<div class="categories-grid">
						{#each data.results.categories as category (category.id)}
							<CategoryCard
								{category}
								selected={selectedCategoryId === category.id}
								onclick={() => toggleCategory(category.id)}
							/>
						{/each}
					</div>
				</section>

				<section class="tests-section">
					<h2>
						Test Results
						{#if selectedCategoryId}
							<button class="clear-filter" onclick={() => (selectedCategoryId = null)}>
								Clear filter
							</button>
						{/if}
					</h2>
					<TestList categories={data.results.categories} {selectedCategoryId} />
				</section>
			</div>
		{/if}
	</main>

	<footer class="footer">
		<p>Svelte Compiler Rust - High-performance Svelte compiler written in Rust</p>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: #0a0a0f;
		color: #fff;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
	}

	.container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header {
		padding: 1rem 2rem;
		background: rgba(10, 10, 15, 0.95);
		border-bottom: 1px solid #0f3460;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.nav {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo {
		font-size: 1.25rem;
		font-weight: 700;
		color: #ff6b35;
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
	}

	.nav-links a {
		color: rgba(255, 255, 255, 0.8);
		text-decoration: none;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: #ff6b35;
	}

	.main {
		flex: 1;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		width: 100%;
		box-sizing: border-box;
	}

	.error-container {
		text-align: center;
		padding: 4rem 2rem;
	}

	.error-container h1 {
		color: #ff5f56;
		margin-bottom: 1rem;
	}

	.error-message {
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 2rem;
	}

	.code-block {
		background: #1a1a2e;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		display: inline-block;
	}

	.code-block code {
		color: #27ca40;
		font-family: 'Menlo', 'Monaco', monospace;
		font-size: 0.9rem;
	}

	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.title-section {
		text-align: center;
	}

	.title-section h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
		background: linear-gradient(135deg, #ff6b35, #ff8c5a);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.meta {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.9rem;
		margin: 0;
	}

	.overall-section {
		display: flex;
		justify-content: center;
	}

	.overall-card {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 2rem 3rem;
		background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
		border: 1px solid #0f3460;
		border-radius: 16px;
	}

	.overall-info h2 {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
		color: #fff;
	}

	.overall-stats {
		font-size: 1.5rem;
		margin: 0;
	}

	.passed {
		color: #27ca40;
		font-weight: 700;
	}

	.separator {
		margin: 0 0.25rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.total {
		font-weight: 600;
	}

	.skipped-info {
		color: #ffbd2e;
		font-size: 0.9rem;
		margin: 0.5rem 0 0;
	}

	.categories-section,
	.tests-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.categories-section h2,
	.tests-section h2 {
		margin: 0;
		font-size: 1.25rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.section-hint {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.85rem;
		margin: 0;
	}

	.categories-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
	}

	.clear-filter {
		font-size: 0.8rem;
		padding: 0.25rem 0.75rem;
		background: transparent;
		border: 1px solid #ff6b35;
		border-radius: 4px;
		color: #ff6b35;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-filter:hover {
		background: #ff6b35;
		color: #fff;
	}

	.footer {
		padding: 2rem;
		text-align: center;
		border-top: 1px solid #0f3460;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.85rem;
	}

	@media (max-width: 768px) {
		.header {
			padding: 1rem;
		}

		.nav {
			flex-direction: column;
			gap: 1rem;
		}

		.main {
			padding: 1rem;
		}

		.overall-card {
			flex-direction: column;
			text-align: center;
			padding: 1.5rem;
		}

		.categories-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
