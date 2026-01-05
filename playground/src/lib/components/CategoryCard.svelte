<script lang="ts">
	import type { Category } from '$lib/types/test-results';
	import ProgressRing from './ProgressRing.svelte';

	interface Props {
		category: Category;
		selected?: boolean;
		onclick?: () => void;
	}

	let { category, selected = false, onclick }: Props = $props();

	const getColor = (percentage: number): string => {
		if (percentage >= 90) return '#27ca40';
		if (percentage >= 50) return '#ffbd2e';
		return '#ff5f56';
	};
</script>

<button class="card" class:selected {onclick}>
	<ProgressRing
		percentage={category.percentage}
		size={64}
		strokeWidth={6}
		color={getColor(category.percentage)}
	/>
	<div class="info">
		<h3 class="name">{category.name}</h3>
		<p class="stats">
			<span class="passed">{category.passed}</span>
			<span class="separator">/</span>
			<span class="total">{category.total - category.skipped}</span>
			{#if category.skipped > 0}
				<span class="skipped">({category.skipped} skipped)</span>
			{/if}
		</p>
	</div>
</button>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.25rem;
		background: linear-gradient(135deg, #16213e 0%, #1a1a2e 100%);
		border: 1px solid #0f3460;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 140px;
	}

	.card:hover {
		border-color: #ff6b35;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.15);
	}

	.card.selected {
		border-color: #ff6b35;
		background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
	}

	.info {
		text-align: center;
	}

	.name {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: #fff;
	}

	.stats {
		margin: 0.25rem 0 0;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.passed {
		color: #27ca40;
		font-weight: 600;
	}

	.separator {
		margin: 0 0.15rem;
	}

	.total {
		font-weight: 500;
	}

	.skipped {
		color: #ffbd2e;
		font-size: 0.7rem;
		margin-left: 0.25rem;
	}
</style>
