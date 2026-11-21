<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Logo from '#lib/Logo.svelte';

	let { children } = $props();

	const links = [
		{ route: '/guide', href: resolve('/guide'), label: 'Guide' },
		{ route: '/rules', href: resolve('/rules'), label: 'Rules' },
		{ route: '/playground', href: resolve('/playground'), label: 'Playground' },
		{ route: '/architecture', href: resolve('/architecture'), label: 'Architecture' },
	];
</script>

<!-- The playground needs the whole window for its two panes. -->
<div class="site" class:wide={page.route.id === '/playground'}>
	<header>
		<a class="home" href={resolve('/')}><Logo /> rsvelte</a>
		<nav>
			{#each links as link (link.href)}
				<a href={link.href} aria-current={page.route.id === link.route ? 'page' : undefined}>
					{link.label}
				</a>
			{/each}
			<a href="https://github.com/baseballyama/rsvelte">GitHub</a>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="muted">
		MIT License · <a href="https://github.com/baseballyama/rsvelte">Source on GitHub</a>
	</footer>
</div>

<style>
	header {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		align-items: center;
		justify-content: space-between;
		max-width: var(--width);
		margin: 0 auto;
		padding: 1rem 1.25rem;
	}

	.home {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		color: inherit;
		font-size: 1.2rem;
		font-weight: 700;
		text-decoration: none;
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.1rem;
	}

	nav a {
		color: var(--muted);
		text-decoration: none;
	}

	nav a:hover,
	nav a[aria-current='page'] {
		color: var(--fg);
	}

	main {
		max-width: var(--width);
		margin: 0 auto;
		padding: 0 1.25rem 3rem;
	}

	.site {
		--width: 60rem;
	}

	.wide {
		--width: 100rem;
	}

	footer {
		max-width: var(--width);
		margin: 0 auto;
		padding: 1.5rem 1.25rem 2.5rem;
		border-top: 1px solid var(--line);
		font-size: 0.9rem;
	}
</style>
