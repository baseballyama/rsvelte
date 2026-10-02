import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";

function generateConnectingSequenceBar(columns) {
	const seq = [];

	for (let x = 0; x < columns; x++) {
		seq.push([x, columns - 1 - x]);
	}

	return seq;
}

function generateListeningSequenceBar(columns) {
	const center = Math.floor(columns / 2);
	const noIndex = -1;

	return [[center], [noIndex]];
}

export default function Bar_visualizer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			agentState,
			barCount = 15,
			mediaStream = null,
			minHeight = 20,
			maxHeight = 100,
			demo = false,
			centerAlign = false,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Volume bands state
		let volumeBands = $.derived(() => new Array(barCount).fill(0.2));

		let highlightedIndices = [];

		// Animation frame IDs for cleanup
		let volumeAnimationId;

		let barAnimationId = null;

		// Audio analysis for real audio
		function createAudioAnalyser(stream) {
			const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
			const audioContext = new AudioContextConstructor();
			const source = audioContext.createMediaStreamSource(stream);
			const analyser = audioContext.createAnalyser();

			analyser.fftSize = 2048;
			source.connect(analyser);

			const cleanup = () => {
				source.disconnect();
				audioContext.close();
			};

			return { analyser, audioContext, cleanup };
		}

		// Multiband volume processing
		function normalizeDb(value) {
			if (value === -Infinity) return 0;

			const minDb = -100;
			const maxDb = -10;
			const db = 1 - Math.max(minDb, Math.min(maxDb, value)) * -1 / 100;

			return Math.sqrt(db);
		}

		$$renderer.push(`<div${$.attributes({
			'data-state': // Real audio volume tracking
			// Fake volume animation for demo mode
			// Bar animation sequencing
			agentState,
			class: $.clsx(cn("relative flex justify-center gap-1.5", centerAlign ? "items-center" : "items-end", "h-32 w-full overflow-hidden rounded-lg bg-muted p-4", className)),
			...restProps
		})}><!--[-->`);

		const each_array = $.ensure_array_like(volumeBands());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let volume = each_array[index];
			const heightPct = Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5));
			const isHighlighted = highlightedIndices?.includes(index) ?? false;

			$$renderer.push(`<div${$.attr('data-highlighted', isHighlighted)}${$.attr_class($.clsx(cn("max-w-[12px] min-w-[8px] flex-1 transition-all duration-150", "rounded-full", "bg-border data-[highlighted=true]:bg-primary", agentState === "speaking" && "bg-primary", agentState === "thinking" && isHighlighted && "animate-pulse")))}${$.attr_style(`height: ${$.stringify(heightPct)}%; ${agentState === 'thinking' ? 'animation-duration: 300ms;' : ''}`)}></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}