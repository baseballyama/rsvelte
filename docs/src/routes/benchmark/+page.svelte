<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { BenchmarkResults } from '$lib/types/benchmark';

	let { data }: { data: PageData } = $props();

	// Animation state
	let animationTime = $state(0);
	let isAnimating = $state(false);
	let animationComplete = $state(false);

	// Animation duration in real ms (how long the animation takes to complete)
	const ANIMATION_DURATION_MS = 3000;

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

	const formatDuration = (ms: number): string => {
		if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
		if (ms < 1000) return `${ms.toFixed(2)}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	};

	const formatThroughput = (value: number, unit: string): string => {
		if (value >= 1000) return `${(value / 1000).toFixed(1)}k ${unit}`;
		return `${value.toFixed(1)} ${unit}`;
	};

	// Get the maximum duration for scaling
	const getMaxDuration = (results: BenchmarkResults): number => {
		return Math.max(
			results.javascript.durationMs,
			results.rustSingleThread.durationMs,
			results.rustMultiThread.durationMs
		);
	};

	// Get current bar width based on animation progress
	const getAnimatedWidth = (results: BenchmarkResults, duration: number): number => {
		const maxDuration = getMaxDuration(results);
		const targetWidth = (duration / maxDuration) * 100;

		if (animationComplete) return targetWidth;

		// Scale animation time to benchmark time
		const scaleFactor = maxDuration / ANIMATION_DURATION_MS;
		const simulatedTime = animationTime * scaleFactor;

		if (simulatedTime >= duration) return targetWidth;

		return (simulatedTime / maxDuration) * 100;
	};

	// Get current displayed time based on animation progress
	const getAnimatedTime = (results: BenchmarkResults, duration: number): number => {
		if (animationComplete) return duration;

		const maxDuration = getMaxDuration(results);
		const scaleFactor = maxDuration / ANIMATION_DURATION_MS;
		const simulatedTime = animationTime * scaleFactor;

		return Math.min(simulatedTime, duration);
	};

	// Check if a specific bar's animation is complete
	const isBarComplete = (results: BenchmarkResults, duration: number): boolean => {
		if (animationComplete) return true;

		const maxDuration = getMaxDuration(results);
		const scaleFactor = maxDuration / ANIMATION_DURATION_MS;
		const simulatedTime = animationTime * scaleFactor;

		return simulatedTime >= duration;
	};

	const startAnimation = () => {
		if (isAnimating || !data.results) return;

		isAnimating = true;
		animationComplete = false;
		animationTime = 0;

		const startTime = performance.now();

		const animate = () => {
			const elapsed = performance.now() - startTime;
			animationTime = elapsed;

			if (elapsed >= ANIMATION_DURATION_MS) {
				animationTime = ANIMATION_DURATION_MS;
				isAnimating = false;
				animationComplete = true;
				return;
			}

			requestAnimationFrame(animate);
		};

		requestAnimationFrame(animate);
	};

	onMount(() => {
		if (data.results) {
			// Start animation after a brief delay
			setTimeout(startAnimation, 500);
		}
	});
</script>

<svelte:head>
	<title>Benchmark - Svelte Compiler Rust</title>
</svelte:head>

<div class="container">
	<header class="header">
		<nav class="nav">
			<a href="/" class="logo">Svelte Compiler Rust</a>
			<div class="nav-links">
				<a href="/">Home</a>
				<a href="/playground">Playground</a>
				<a href="/progress">Progress</a>
				<a href="/benchmark" class="active">Benchmark</a>
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
				<h1>Benchmark Results Not Available</h1>
				<p class="error-message">{data.error}</p>
				<div class="code-block">
					<code>
						node scripts/run-benchmark.mjs > docs/static/benchmark-results.json
					</code>
				</div>
			</div>
		{:else if data.results}
			{@const results = data.results}
			<div class="dashboard">
				<div class="title-section">
					<h1>Performance Benchmark</h1>
					<p class="meta">
						Last updated: {formatDate(results.generatedAt)} | Commit: {results.commitSha}
					</p>
					<p class="meta">
						{results.testFilesCount} files
					</p>
				</div>

				<!-- Speedup Hero Section -->
				<div class="speedup-hero">
					<div class="speedup-card main-speedup">
						<div class="speedup-value">{results.speedup.multiThreadVsJs.toFixed(1)}x</div>
						<div class="speedup-label">Faster (Multi-threaded)</div>
						<div class="speedup-comparison">Rust vs JavaScript</div>
					</div>
					<div class="speedup-secondary">
						<div class="speedup-card">
							<div class="speedup-value small">{results.speedup.singleThreadVsJs.toFixed(1)}x</div>
							<div class="speedup-label">Single-threaded</div>
						</div>
					</div>
				</div>

				<!-- Duration Comparison Chart -->
				<section class="chart-section">
					<div class="chart-header">
						<div>
							<h2>Compilation Time</h2>
							<p class="section-description">Lower is better (total time to compile all test files)</p>
						</div>
						<button
							class="replay-button"
							onclick={startAnimation}
							disabled={isAnimating}
						>
							Replay
						</button>
					</div>

					<div class="bar-chart">
						<div class="bar-row">
							<div class="bar-label">
								<span class="bar-name">JavaScript</span>
								<span class="bar-value" class:complete={isBarComplete(results, results.javascript.durationMs)}>
									{formatDuration(getAnimatedTime(results, results.javascript.durationMs))}
								</span>
							</div>
							<div class="bar-container">
								<div
									class="bar js-bar"
									class:complete={isBarComplete(results, results.javascript.durationMs)}
									style="width: {getAnimatedWidth(results, results.javascript.durationMs)}%"
								></div>
							</div>
						</div>

						<div class="bar-row">
							<div class="bar-label">
								<span class="bar-name">Rust (single)</span>
								<span class="bar-value" class:complete={isBarComplete(results, results.rustSingleThread.durationMs)}>
									{formatDuration(getAnimatedTime(results, results.rustSingleThread.durationMs))}
								</span>
							</div>
							<div class="bar-container">
								<div
									class="bar rust-single-bar"
									class:complete={isBarComplete(results, results.rustSingleThread.durationMs)}
									style="width: {getAnimatedWidth(results, results.rustSingleThread.durationMs)}%"
								></div>
							</div>
						</div>

						<div class="bar-row">
							<div class="bar-label">
								<span class="bar-name">Rust (multi)</span>
								<span class="bar-value" class:complete={isBarComplete(results, results.rustMultiThread.durationMs)}>
									{formatDuration(getAnimatedTime(results, results.rustMultiThread.durationMs))}
								</span>
							</div>
							<div class="bar-container">
								<div
									class="bar rust-multi-bar"
									class:complete={isBarComplete(results, results.rustMultiThread.durationMs)}
									style="width: {getAnimatedWidth(results, results.rustMultiThread.durationMs)}%"
								></div>
							</div>
						</div>
					</div>
				</section>

				<!-- Throughput Comparison -->
				<section class="metrics-section">
					<h2>Throughput</h2>
					<p class="section-description">Higher is better</p>

					<div class="metrics-grid">
						<div class="metric-card js-card">
							<h3>JavaScript</h3>
							<span class="metric-number">{formatThroughput(results.javascript.throughputFilesPerSec, 'files/sec')}</span>
						</div>

						<div class="metric-card rust-single-card">
							<h3>Rust (Single-threaded)</h3>
							<span class="metric-number">{formatThroughput(results.rustSingleThread.throughputFilesPerSec, 'files/sec')}</span>
						</div>

						<div class="metric-card rust-multi-card">
							<h3>Rust (Multi-threaded)</h3>
							<span class="metric-number">{formatThroughput(results.rustMultiThread.throughputFilesPerSec, 'files/sec')}</span>
						</div>
					</div>
				</section>


				<!-- How to Run -->
				<section class="howto-section">
					<h2>Run Benchmarks</h2>
					<p class="section-description">Generate new benchmark results on your machine</p>
					<div class="code-block">
						<code>
							# Build the Rust compiler
							cargo build --release

							# Run the benchmark
							node scripts/run-benchmark.mjs > docs/static/benchmark-results.json

							# View results
							cd docs && npm run dev
						</code>
					</div>
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
		text-align: left;
		overflow-x: auto;
	}

	.code-block code {
		color: #27ca40;
		font-family: 'Menlo', 'Monaco', monospace;
		font-size: 0.85rem;
		white-space: pre-wrap;
	}

	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.title-section {
		text-align: center;
	}

	.title-section h1 {
		margin: 0 0 0.5rem;
		font-size: 2.5rem;
		background: linear-gradient(135deg, #ff6b35, #ff8c5a);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.meta {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.9rem;
		margin: 0.25rem 0;
	}

	/* Speedup Hero Section */
	.speedup-hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.speedup-card {
		background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
		border: 1px solid #0f3460;
		border-radius: 16px;
		padding: 1.5rem 2rem;
		text-align: center;
	}

	.speedup-card.main-speedup {
		padding: 2.5rem 4rem;
	}

	.speedup-value {
		font-size: 5rem;
		font-weight: 800;
		background: linear-gradient(135deg, #27ca40, #4ade80);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1;
	}

	.speedup-value.small {
		font-size: 2.5rem;
	}

	.speedup-label {
		font-size: 1.25rem;
		color: rgba(255, 255, 255, 0.9);
		margin-top: 0.5rem;
	}

	.speedup-comparison {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 0.5rem;
	}

	.speedup-secondary {
		display: flex;
		gap: 1rem;
	}

	/* Chart Section */
	.chart-section,
	.metrics-section,
	.howto-section {
		background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
		border: 1px solid #0f3460;
		border-radius: 16px;
		padding: 2rem;
	}

	.chart-section h2,
	.metrics-section h2,
	.howto-section h2 {
		margin: 0 0 0.5rem;
		font-size: 1.5rem;
		color: #fff;
	}

	.section-description {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.9rem;
		margin: 0 0 1.5rem;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
	}

	.chart-header .section-description {
		margin: 0;
	}

	.replay-button {
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		color: #fff;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.replay-button:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.15);
		border-color: #ff6b35;
		color: #ff6b35;
	}

	.replay-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Bar Chart */
	.bar-chart {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.bar-row {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.bar-label {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.bar-name {
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
	}

	.bar-value {
		font-family: 'Menlo', 'Monaco', monospace;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.5);
		transition: color 0.3s;
	}

	.bar-value.complete {
		color: rgba(255, 255, 255, 0.9);
	}

	.bar-container {
		height: 32px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		border-radius: 8px;
		opacity: 0.7;
		transition: opacity 0.3s;
	}

	.bar.complete {
		opacity: 1;
	}

	.js-bar {
		background: linear-gradient(90deg, #f7df1e, #f0db4f);
	}

	.rust-single-bar {
		background: linear-gradient(90deg, #ff6b35, #ff8c5a);
	}

	.rust-multi-bar {
		background: linear-gradient(90deg, #27ca40, #4ade80);
	}

	/* Metrics Grid */
	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.metric-card {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.metric-card h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.js-card {
		border-color: rgba(247, 223, 30, 0.3);
	}

	.rust-single-card {
		border-color: rgba(255, 107, 53, 0.3);
	}

	.rust-multi-card {
		border-color: rgba(39, 202, 64, 0.3);
	}

	.metric-number {
		font-size: 1.5rem;
		font-weight: 600;
		font-family: 'Menlo', 'Monaco', monospace;
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

		.speedup-value {
			font-size: 3.5rem;
		}

		.speedup-secondary {
			flex-direction: column;
		}

		.metrics-grid {
			grid-template-columns: 1fr;
		}

		.timeline-label {
			width: 80px;
			font-size: 0.8rem;
		}
	}
</style>
