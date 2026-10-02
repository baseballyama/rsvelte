<script lang="ts">
	import { listen } from '@tauri-apps/api/event';
	import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';

	let hudText = $state('');
	let hudEl = $state<HTMLDivElement | null>(null);

	listen('hud-message', (event) => {
		hudText = event.payload as string;
	});

	$effect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				const bounds = entry.contentRect;
				const window = getCurrentWindow();
				window.setMinSize(new LogicalSize(bounds.width, bounds.height));
				window.setMaxSize(new LogicalSize(bounds.width, bounds.height));
				window.setSize(new LogicalSize(bounds.width, bounds.height));
				window.center();
			});
		});
		resizeObserver.observe(hudEl!);

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<div class="flex h-screen items-center justify-center bg-transparent">
	{#if hudText}
		<div
			class="rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white"
			bind:this={hudEl}
		>
			{hudText}
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background-color: transparent;
	}
</style>
