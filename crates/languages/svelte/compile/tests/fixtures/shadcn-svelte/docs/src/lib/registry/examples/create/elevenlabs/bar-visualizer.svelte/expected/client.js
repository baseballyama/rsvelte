import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'agentState',
	'barCount',
	'mediaStream',
	'minHeight',
	'maxHeight',
	'demo',
	'centerAlign',
	'class'
]);

var root = $.from_html(`<div></div>`);

export default function Bar_visualizer($$anchor, $$props) {
	$.push($$props, true);

	let barCount = $.prop($$props, 'barCount', 3, 15),
		mediaStream = $.prop($$props, 'mediaStream', 3, null),
		minHeight = $.prop($$props, 'minHeight', 3, 20),
		maxHeight = $.prop($$props, 'maxHeight', 3, 100),
		demo = $.prop($$props, 'demo', 3, false),
		centerAlign = $.prop($$props, 'centerAlign', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	// Volume bands state
	let volumeBands = $.derived(() => new Array(barCount()).fill(0.2));

	let highlightedIndices = $.state($.proxy([]));

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

	// Real audio volume tracking
	$.user_effect(() => {
		if (demo() || !mediaStream()) {
			return;
		}

		const bands = barCount();
		const loPass = 100;
		const hiPass = 200;
		const updateInterval = 32;
		const { analyser, cleanup } = createAudioAnalyser(mediaStream());
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Float32Array(bufferLength);
		const sliceStart = loPass;
		const sliceEnd = hiPass;
		const sliceLength = sliceEnd - sliceStart;
		const chunkSize = Math.ceil(sliceLength / bands);
		let lastUpdate = 0;

		const updateVolume = (timestamp) => {
			if (timestamp - lastUpdate >= updateInterval) {
				analyser.getFloatFrequencyData(dataArray);

				const chunks = new Array(bands);

				for (let i = 0; i < bands; i++) {
					let sum = 0;
					let count = 0;
					const startIdx = sliceStart + i * chunkSize;
					const endIdx = Math.min(sliceStart + (i + 1) * chunkSize, sliceEnd);

					for (let j = startIdx; j < endIdx; j++) {
						sum += normalizeDb(dataArray[j]);
						count++;
					}

					chunks[i] = count > 0 ? sum / count : 0;
				}

				$.set(volumeBands, chunks);
				lastUpdate = timestamp;
			}

			volumeAnimationId = requestAnimationFrame(updateVolume);
		};

		volumeAnimationId = requestAnimationFrame(updateVolume);

		return () => {
			cleanup();

			if (volumeAnimationId) {
				cancelAnimationFrame(volumeAnimationId);
			}
		};
	});

	// Fake volume animation for demo mode
	$.user_effect(() => {
		if (!demo()) return;

		if ($$props.agentState !== "speaking" && $$props.agentState !== "listening") {
			$.set(volumeBands, new Array(barCount()).fill(0.2));

			return;
		}

		const startTime = Date.now() / 1000;
		const updateInterval = 50;
		let lastUpdate = 0;

		const updateFakeVolume = (timestamp) => {
			if (timestamp - lastUpdate >= updateInterval) {
				const time = Date.now() / 1000 - startTime;
				const newBands = new Array(barCount());

				for (let i = 0; i < barCount(); i++) {
					const waveOffset = i * 0.5;
					const baseVolume = Math.sin(time * 2 + waveOffset) * 0.3 + 0.5;
					const randomNoise = Math.random() * 0.2;

					newBands[i] = Math.max(0.1, Math.min(1, baseVolume + randomNoise));
				}

				$.set(volumeBands, newBands);
				lastUpdate = timestamp;
			}

			volumeAnimationId = requestAnimationFrame(updateFakeVolume);
		};

		volumeAnimationId = requestAnimationFrame(updateFakeVolume);

		return () => {
			if (volumeAnimationId) {
				cancelAnimationFrame(volumeAnimationId);
			}
		};
	});

	// Bar animation sequencing
	$.user_effect(() => {
		const animState = $$props.agentState;
		let sequence;

		if (animState === "thinking" || animState === "listening") {
			sequence = generateListeningSequenceBar(barCount());
		} else if (animState === "connecting" || animState === "initializing") {
			sequence = generateConnectingSequenceBar(barCount());
		} else if (animState === undefined || animState === "speaking") {
			sequence = [new Array(barCount()).fill(0).map((_, idx) => idx)];
		} else {
			sequence = [[]];
		}

		const interval = animState === "connecting"
			? 2000 / barCount()
			: animState === "thinking" ? 150 : animState === "listening" ? 500 : 1000;

		let indexRef = 0;

		$.set(highlightedIndices, sequence[0] || [], true);

		let startTime = performance.now();

		const animate = (time) => {
			const timeElapsed = time - startTime;

			if (timeElapsed >= interval) {
				indexRef = (indexRef + 1) % sequence.length;
				$.set(highlightedIndices, sequence[indexRef] || [], true);
				startTime = time;
			}

			barAnimationId = requestAnimationFrame(animate);
		};

		barAnimationId = requestAnimationFrame(animate);

		return () => {
			if (barAnimationId !== null) {
				cancelAnimationFrame(barAnimationId);
			}
		};
	});

	var div = root();

	$.attribute_effect(div, ($0) => ({ 'data-state': $$props.agentState, class: $0, ...restProps }), [
		() => cn("relative flex justify-center gap-1.5", centerAlign() ? "items-center" : "items-end", "h-32 w-full overflow-hidden rounded-lg bg-muted p-4", $$props.class)
	]);

	$.each(div, 21, () => $.get(volumeBands), $.index, ($$anchor, volume, index) => {
		const heightPct = $.derived(() => Math.min(maxHeight(), Math.max(minHeight(), $.get(volume) * 100 + 5)));
		const isHighlighted = $.derived(() => $.get(highlightedIndices)?.includes(index) ?? false);
		var div_1 = root();

		$.template_effect(
			($0) => {
				$.set_attribute(div_1, 'data-highlighted', $.get(isHighlighted));
				$.set_class(div_1, 1, $0);
				$.set_style(div_1, `height: ${$.get(heightPct) ?? ''}%; ${$$props.agentState === 'thinking' ? 'animation-duration: 300ms;' : ''}`);
			},
			[
				() => $.clsx(cn("max-w-[12px] min-w-[8px] flex-1 transition-all duration-150", "rounded-full", "bg-border data-[highlighted=true]:bg-primary", $$props.agentState === "speaking" && "bg-primary", $$props.agentState === "thinking" && $.get(isHighlighted) && "animate-pulse"))
			]
		);

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}