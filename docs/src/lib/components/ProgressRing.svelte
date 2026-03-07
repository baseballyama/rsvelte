<script lang="ts">
	interface Props {
		percentage: number;
		size?: number;
		strokeWidth?: number;
		color?: string;
		showText?: boolean;
	}

	let {
		percentage,
		size = 80,
		strokeWidth = 8,
		color = '#27ca40',
		showText = true
	}: Props = $props();

	const radius = $derived((size - strokeWidth) / 2);
	const circumference = $derived(2 * Math.PI * radius);
	const offset = $derived(circumference - (percentage / 100) * circumference);
</script>

<div class="progress-ring" style="width: {size}px; height: {size}px;">
	<svg width={size} height={size}>
		<circle class="background" cx={size / 2} cy={size / 2} r={radius} stroke-width={strokeWidth} />
		<circle
			class="progress"
			cx={size / 2}
			cy={size / 2}
			r={radius}
			stroke-width={strokeWidth}
			stroke={color}
			stroke-dasharray={circumference}
			stroke-dashoffset={offset}
			transform="rotate(-90 {size / 2} {size / 2})"
		/>
	</svg>
	{#if showText}
		<div class="text">
			<span class="percentage">{Math.round(percentage)}%</span>
		</div>
	{/if}
</div>

<style>
	.progress-ring {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
	}

	circle {
		fill: none;
		transition:
			stroke-dashoffset 0.5s ease-out,
			stroke 0.3s ease;
	}

	.background {
		stroke: rgba(255, 255, 255, 0.1);
	}

	.progress {
		stroke-linecap: round;
	}

	.text {
		position: relative;
		z-index: 1;
		text-align: center;
	}

	.percentage {
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
	}
</style>
