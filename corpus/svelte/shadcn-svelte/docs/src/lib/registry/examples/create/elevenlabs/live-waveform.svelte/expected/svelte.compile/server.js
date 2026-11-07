import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { cn } from "$lib/utils.js";

export default function Live_waveform($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			active = false,
			processing = false,
			deviceId,
			barWidth = 3,
			barGap = 1,
			barRadius = 1.5,
			barColor,
			fadeEdges = true,
			fadeWidth = 24,
			barHeight: baseBarHeight = 4,
			height = 64,
			sensitivity = 1,
			smoothingTimeConstant = 0.8,
			fftSize = 256,
			historySize = 60,
			updateRate = 30,
			mode = "static",
			onError,
			onStreamReady,
			onStreamEnd,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let canvasRef;
		let containerRef;

		// Refs for animation state
		let history = [];

		let analyser = null;
		let audioContext = null;
		let stream = null;
		let animationId = 0;
		let lastUpdate = 0;
		let processingAnimationId = null;
		let lastActiveData = [];
		let transitionProgress = 0;
		let staticBars = [];
		let needsRedraw = true;
		let gradientCache = null;
		let lastWidth = 0;
		const heightStyle = $.derived(() => typeof height === "number" ? `${height}px` : height);

		onMount(() => {
			// Handle canvas resizing
			const resizeObserver = new ResizeObserver(() => {
				if (!canvasRef || !containerRef) return;

				const rect = containerRef.getBoundingClientRect();
				const dpr = window.devicePixelRatio || 1;

				canvasRef.width = rect.width * dpr;
				canvasRef.height = rect.height * dpr;
				canvasRef.style.width = `${rect.width}px`;
				canvasRef.style.height = `${rect.height}px`;

				const ctx = canvasRef.getContext("2d");

				if (ctx) {
					ctx.scale(dpr, dpr);
				}

				gradientCache = null;
				lastWidth = rect.width;
				needsRedraw = true;
			});

			resizeObserver.observe(containerRef);

			return () => {
				resizeObserver.disconnect();
			};
		});

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(
				// Handle processing animation (when not active but processing)
				// Fade to idle
				// Handle microphone setup and teardown
				// Clear history when starting
				// Animation loop
				// Update audio data if active
				// For static mode, update bars in place
				// Mirror the data for symmetric display
				// Scrolling mode - original behavior
				// Add to history
				// Maintain history size
				// Only redraw if needed
				// Draw bars based on mode
				// Scrolling mode
				// Apply edge fading
				cn("relative h-full w-full", className)
			),
			style: `height: ${$.stringify(heightStyle())};`,
			'aria-label': active
				? "Live audio waveform"
				: processing ? "Processing audio" : "Audio waveform idle",
			role: 'img',
			...restProps
		})}>`);

		if (!active && !processing) {
			$$renderer.push(`<!--[0--><div class="absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dotted border-muted-foreground/20"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <canvas class="block h-full w-full" aria-hidden="true"></canvas></div>`);
	});
}