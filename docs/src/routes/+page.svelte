<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const features = [
		{
			icon: '100x',
			title: 'Blazing Fast',
			description:
				'Built with Rust for maximum performance. Compile your Svelte components 100x faster than the JavaScript implementation.'
		},
		{
			icon: '</>',
			title: 'Drop-in Replacement',
			description:
				'Fully compatible with the official Svelte compiler. Switch seamlessly without changing your existing codebase.'
		},
		{
			icon: 'OXC',
			title: 'OXC Integration',
			description:
				'Designed for integration with OXC ecosystem. Use with oxfmt for formatting and oxlint for linting.'
		},
		{
			icon: 'SSR',
			title: 'Full SSR Support',
			description:
				'Complete server-side rendering support. Generate optimized HTML for both client and server environments.'
		}
	];

	const codeExample = `<script>
  let count = $state(0);

  function increment() {
    count++;
  }
<\/script>

<button onclick={increment}>
  Clicked {count} times
</button>

<style>
  button {
    padding: 1rem 2rem;
    font-size: 1.25rem;
  }
</style>`;

	const compiledExample = `import * as $ from "svelte/internal/client";

export default function Component($$anchor) {
  let count = $.state(0);
  var button = $.from_html(\`<button> </button>\`);

  button.__click = function increment() {
    $.set(count, $.get(count) + 1);
  };

  var text = $.child(button);
  $.template_effect(() =>
    $.set_text(text, \`Clicked \${$.get(count)} times\`)
  );

  $.append($$anchor, button);
}`;
</script>

<svelte:head>
	<title>Svelte Compiler Rust - 100x Faster Svelte Compilation</title>
	<meta
		name="description"
		content="A high-performance Rust implementation of the Svelte compiler. Compile your Svelte components 100x faster."
	/>
</svelte:head>

<div class="page" class:mounted>
	<!-- Navigation -->
	<nav class="nav">
		<div class="nav-content">
			<a href="{base}/" class="nav-logo">
				<span class="logo-text">Svelte Compiler</span>
				<span class="logo-rust">Rust</span>
			</a>
			<div class="nav-links">
				<a href="#features">Features</a>
				<a href="#demo">Demo</a>
				<a href="{base}/progress">Progress</a>
				<a href="{base}/benchmark">Benchmark</a>
				<a
					href="https://github.com/baseballyama/rsvelte"
					target="_blank"
					rel="noopener">GitHub</a
				>
				<a href="{base}/playground" class="nav-cta">Try Playground</a>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<section class="hero">
		<div class="hero-bg">
			<div class="gradient-orb orb-1"></div>
			<div class="gradient-orb orb-2"></div>
			<div class="gradient-orb orb-3"></div>
		</div>
		<div class="hero-content">
			<div class="hero-badge">
				<span class="badge-icon">Rust</span>
				<span>Powered by Rust</span>
			</div>
			<h1 class="hero-title">
				<span class="title-line">Compile Svelte</span>
				<span class="title-line gradient-text">100x Faster</span>
			</h1>
			<p class="hero-description">
				A high-performance Rust implementation of the Svelte compiler. Drop-in replacement with
				blazing fast compilation speeds.
			</p>
			<div class="hero-actions">
				<a href="{base}/playground" class="btn btn-primary">
					<span>Open Playground</span>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</a>
				<a
					href="https://github.com/baseballyama/rsvelte"
					class="btn btn-secondary"
					target="_blank"
					rel="noopener"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					<span>View on GitHub</span>
				</a>
			</div>
			<div class="hero-stats">
				<div class="stat">
					<span class="stat-value">100x</span>
					<span class="stat-label">Faster</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat">
					<span class="stat-value">100%</span>
					<span class="stat-label">Compatible</span>
				</div>
				<div class="stat-divider"></div>
				<div class="stat">
					<span class="stat-value">0</span>
					<span class="stat-label">Runtime Overhead</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="features">
		<div class="section-content">
			<h2 class="section-title">Why Svelte Compiler Rust?</h2>
			<p class="section-description">
				Experience the next generation of Svelte compilation with unmatched performance and
				reliability.
			</p>
			<div class="features-grid">
				{#each features as feature}
					<div class="feature-card">
						<div class="feature-icon">{feature.icon}</div>
						<h3 class="feature-title">{feature.title}</h3>
						<p class="feature-description">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Demo Section -->
	<section id="demo" class="demo">
		<div class="section-content">
			<h2 class="section-title">See It In Action</h2>
			<p class="section-description">Write Svelte code and see the compiled output in real-time.</p>
			<div class="code-comparison">
				<div class="code-panel">
					<div class="code-header">
						<span class="code-dot red"></span>
						<span class="code-dot yellow"></span>
						<span class="code-dot green"></span>
						<span class="code-title">Input.svelte</span>
					</div>
					<pre class="code-content"><code>{codeExample}</code></pre>
				</div>
				<div class="code-arrow">
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</div>
				<div class="code-panel">
					<div class="code-header">
						<span class="code-dot red"></span>
						<span class="code-dot yellow"></span>
						<span class="code-dot green"></span>
						<span class="code-title">Compiled Output</span>
					</div>
					<pre class="code-content"><code>{compiledExample}</code></pre>
				</div>
			</div>
			<div class="demo-cta">
				<a href="{base}/playground" class="btn btn-primary btn-large">
					<span>Try It Yourself</span>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</a>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="cta-section">
		<div class="section-content">
			<div class="cta-box">
				<h2 class="cta-title">Ready to Supercharge Your Svelte Development?</h2>
				<p class="cta-description">
					Start using Svelte Compiler Rust today and experience the difference.
				</p>
				<div class="cta-actions">
					<a href="{base}/playground" class="btn btn-primary btn-large">
						<span>Open Playground</span>
					</a>
					<a
						href="https://github.com/baseballyama/rsvelte"
						class="btn btn-outline btn-large"
						target="_blank"
						rel="noopener"
					>
						<span>Get Started</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="footer-content">
			<div class="footer-logo">
				<span class="logo-text">Svelte Compiler</span>
				<span class="logo-rust">Rust</span>
			</div>
			<div class="footer-links">
				<a
					href="https://github.com/baseballyama/rsvelte"
					target="_blank"
					rel="noopener">GitHub</a
				>
				<a href="{base}/playground">Playground</a>
				<a href="{base}/progress">Progress</a>
				<a href="{base}/benchmark">Benchmark</a>
				<a href="https://svelte.dev" target="_blank" rel="noopener">Svelte</a>
			</div>
			<div class="footer-copy">Built with Rust. Open Source.</div>
		</div>
	</footer>
</div>

<style>
	/* Base */
	.page {
		min-height: 100vh;
		opacity: 0;
		transition: opacity 0.5s ease;
	}

	.page.mounted {
		opacity: 1;
	}

	/* Navigation */
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: rgba(10, 10, 15, 0.8);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.nav-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		font-size: 1.25rem;
	}

	.logo-text {
		color: #e4e4e7;
	}

	.logo-rust {
		color: #ff6b35;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.nav-links a {
		font-size: 0.9rem;
		color: #a1a1aa;
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: #fff;
	}

	.nav-cta {
		padding: 0.5rem 1rem !important;
		background: #ff6b35 !important;
		color: #fff !important;
		border-radius: 8px;
		font-weight: 500 !important;
	}

	.nav-cta:hover {
		background: #e55a2b !important;
	}

	/* Hero */
	.hero {
		position: relative;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6rem 2rem 4rem;
		overflow: hidden;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}

	.gradient-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		opacity: 0.5;
	}

	.orb-1 {
		width: 600px;
		height: 600px;
		background: radial-gradient(circle, #ff6b35 0%, transparent 70%);
		top: -200px;
		right: -100px;
		animation: float 8s ease-in-out infinite;
	}

	.orb-2 {
		width: 400px;
		height: 400px;
		background: radial-gradient(circle, #ff9f1c 0%, transparent 70%);
		bottom: -100px;
		left: -100px;
		animation: float 10s ease-in-out infinite reverse;
	}

	.orb-3 {
		width: 300px;
		height: 300px;
		background: radial-gradient(circle, #4f46e5 0%, transparent 70%);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation: pulse 6s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-30px);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
			transform: translate(-50%, -50%) scale(1);
		}
		50% {
			opacity: 0.5;
			transform: translate(-50%, -50%) scale(1.1);
		}
	}

	.hero-content {
		position: relative;
		text-align: center;
		max-width: 900px;
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 107, 53, 0.1);
		border: 1px solid rgba(255, 107, 53, 0.3);
		border-radius: 100px;
		font-size: 0.875rem;
		color: #ff6b35;
		margin-bottom: 2rem;
	}

	.badge-icon {
		background: #ff6b35;
		color: #fff;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.75rem;
	}

	.hero-title {
		font-size: clamp(3rem, 8vw, 5rem);
		font-weight: 800;
		line-height: 1.1;
		margin-bottom: 1.5rem;
	}

	.title-line {
		display: block;
	}

	.gradient-text {
		background: linear-gradient(135deg, #ff6b35 0%, #ff9f1c 50%, #ffd93d 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-description {
		font-size: 1.25rem;
		color: #a1a1aa;
		max-width: 600px;
		margin: 0 auto 2.5rem;
	}

	.hero-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-bottom: 4rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.875rem 1.5rem;
		border-radius: 10px;
		font-weight: 600;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #ff6b35;
		color: #fff;
	}

	.btn-primary:hover {
		background: #e55a2b;
		transform: translateY(-2px);
		box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
	}

	.btn-secondary {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.btn-outline {
		background: transparent;
		color: #fff;
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.btn-outline:hover {
		border-color: #ff6b35;
		color: #ff6b35;
	}

	.btn-large {
		padding: 1rem 2rem;
		font-size: 1.125rem;
	}

	.hero-stats {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.stat {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 2.5rem;
		font-weight: 800;
		color: #ff6b35;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #71717a;
	}

	.stat-divider {
		width: 1px;
		height: 40px;
		background: rgba(255, 255, 255, 0.1);
	}

	/* Features */
	.features {
		padding: 8rem 2rem;
		background: linear-gradient(180deg, rgba(10, 10, 15, 0) 0%, rgba(15, 52, 96, 0.2) 100%);
	}

	.section-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 2.5rem;
		font-weight: 700;
		text-align: center;
		margin-bottom: 1rem;
	}

	.section-description {
		text-align: center;
		color: #a1a1aa;
		font-size: 1.125rem;
		max-width: 600px;
		margin: 0 auto 4rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.feature-card {
		padding: 2rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		transition: all 0.3s;
	}

	.feature-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 107, 53, 0.3);
		transform: translateY(-4px);
	}

	.feature-icon {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #ff6b35 0%, #ff9f1c 100%);
		border-radius: 12px;
		font-weight: 800;
		font-size: 1rem;
		color: #fff;
		margin-bottom: 1.5rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.feature-description {
		color: #a1a1aa;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	/* Demo */
	.demo {
		padding: 8rem 2rem;
	}

	.code-comparison {
		display: flex;
		align-items: center;
		gap: 2rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	.code-panel {
		flex: 1;
		min-width: 300px;
		max-width: 500px;
		background: #16213e;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.code-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(0, 0, 0, 0.3);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.code-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.code-dot.red {
		background: #ff5f56;
	}
	.code-dot.yellow {
		background: #ffbd2e;
	}
	.code-dot.green {
		background: #27ca40;
	}

	.code-title {
		margin-left: 0.5rem;
		font-size: 0.8rem;
		color: #a1a1aa;
	}

	.code-content {
		padding: 1.5rem;
		overflow-x: auto;
		font-size: 0.85rem;
		line-height: 1.6;
		color: #e4e4e7;
	}

	.code-content code {
		white-space: pre;
	}

	.code-arrow {
		color: #ff6b35;
		flex-shrink: 0;
	}

	.demo-cta {
		text-align: center;
		margin-top: 4rem;
	}

	/* CTA Section */
	.cta-section {
		padding: 4rem 2rem 8rem;
	}

	.cta-box {
		background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 159, 28, 0.1) 100%);
		border: 1px solid rgba(255, 107, 53, 0.3);
		border-radius: 24px;
		padding: 4rem;
		text-align: center;
	}

	.cta-title {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.cta-description {
		color: #a1a1aa;
		font-size: 1.125rem;
		margin-bottom: 2rem;
	}

	.cta-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	/* Footer */
	.footer {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 3rem 2rem;
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	.footer-logo {
		font-weight: 700;
		font-size: 1.125rem;
	}

	.footer-links {
		display: flex;
		gap: 2rem;
	}

	.footer-links a {
		color: #71717a;
		font-size: 0.9rem;
		transition: color 0.2s;
	}

	.footer-links a:hover {
		color: #fff;
	}

	.footer-copy {
		color: #52525b;
		font-size: 0.875rem;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}

		.hero-title {
			font-size: 2.5rem;
		}

		.hero-stats {
			gap: 1rem;
		}

		.stat-divider {
			display: none;
		}

		.code-arrow {
			transform: rotate(90deg);
		}

		.cta-box {
			padding: 2rem;
		}

		.footer-content {
			flex-direction: column;
			text-align: center;
		}
	}
</style>
