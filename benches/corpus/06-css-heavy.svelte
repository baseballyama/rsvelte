<script>
	let theme = $state('light');
	let active = $state(0);
	let pulse = $state(true);

	const cards = [
		{ title: 'Performance', body: 'Compiled, not interpreted.' },
		{ title: 'Reactivity', body: 'Fine-grained by default.' },
		{ title: 'Ergonomics', body: 'Less boilerplate.' }
	];
</script>

<div class="surface" data-theme={theme} class:pulse>
	<header class="bar">
		<h1>Showcase</h1>
		<button
			class="toggle"
			style:--accent={theme === 'light' ? '#2563eb' : '#f59e0b'}
			onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}
		>
			{theme}
		</button>
	</header>

	<div class="grid">
		{#each cards as card, i}
			<article class="card" class:selected={active === i} onclick={() => (active = i)}>
				<h2>{card.title}</h2>
				<p>{card.body}</p>
			</article>
		{/each}
	</div>
</div>

<style>
	.surface {
		--bg: #ffffff;
		--fg: #111827;
		--muted: #6b7280;
		background: var(--bg);
		color: var(--fg);
		padding: 1.5rem;
		border-radius: 0.75rem;
		transition: background 0.2s ease;
	}

	.surface[data-theme='dark'] {
		--bg: #0f172a;
		--fg: #f8fafc;
		--muted: #94a3b8;
	}

	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;

		& h1 {
			margin: 0;
			font-size: 1.25rem;
		}
	}

	.toggle {
		background: var(--accent, #2563eb);
		color: white;
		border: none;
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		text-transform: capitalize;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.card {
		border: 1px solid color-mix(in srgb, var(--fg) 12%, transparent);
		border-radius: 0.5rem;
		padding: 1rem;
		cursor: pointer;

		& h2 {
			margin: 0 0 0.25rem;
			font-size: 1rem;
		}

		& p {
			margin: 0;
			color: var(--muted);
		}

		&:hover {
			transform: translateY(-2px);
		}

		&.selected {
			outline: 2px solid var(--accent, #2563eb);
		}
	}

	.pulse .card.selected {
		animation: glow 1.5s ease-in-out infinite;
	}

	:global(body) {
		margin: 0;
	}

	@keyframes glow {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
		}
	}
</style>
