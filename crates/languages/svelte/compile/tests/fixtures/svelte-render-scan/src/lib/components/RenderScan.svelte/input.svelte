<script lang="ts">
	import Eye from '$lib/components/Logo.svelte';
	import RenderScanObserver from './RenderScanObserver.svelte';
	import { onMount } from 'svelte';

	// Props with defaults
	let {
		initialEnabled = true,
		offsetLeft = 0,
		hideIcon = false,
		callback = undefined,
		duration = 1000
	} = $props<{
		initialEnabled?: boolean;
		offsetLeft?: number;
		hideIcon?: boolean;
		callback?: (mutationRecord: MutationRecord) => void;
		duration?: number;
	}>();

	// State management
	let enabled = $state(initialEnabled);

	// Fixed colors for enabled/disabled states
	const enabledColor = '#2189b5';
	const disabledColor = '#9ca3af';

	// Load saved state from localStorage on mount
	onMount(() => {
		const savedState = localStorage.getItem('svelte-render-scan-enabled');
		if (savedState !== null) {
			enabled = savedState === 'true';
		}
	});

	// Toggle handler that also saves to localStorage
	function toggleEnabled() {
		enabled = !enabled;
		localStorage.setItem('svelte-render-scan-enabled', enabled.toString());
	}
</script>

{#if enabled}
	<RenderScanObserver {callback} {duration} />
{/if}

<!-- Floating button -->
{#if !hideIcon}
	<button
		style:background-color={enabled ? enabledColor : disabledColor}
		style:right={`calc(1rem + ${offsetLeft}px)`}
		onclick={toggleEnabled}
		title={enabled ? 'Disable render scanning' : 'Enable render scanning'}
	>
		<div class:enabled>
			<Eye color="white" size={24} />
		</div>
	</button>
{/if}

<style>
	button {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		height: 3rem;
		width: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		transition:
			transform 0.2s ease,
			background-color 0.3s ease;
		border: none;
		cursor: pointer;
		z-index: 100000;
	}

	button:hover {
		transform: scale(1.1);
	}

	button:active {
		transform: scale(0.95);
	}

	div {
		transition: transform 0.5s ease;
	}

	div.enabled {
		transform: rotate(360deg);
	}

	div:not(.enabled) {
		transform: rotate(0deg);
	}
</style>
