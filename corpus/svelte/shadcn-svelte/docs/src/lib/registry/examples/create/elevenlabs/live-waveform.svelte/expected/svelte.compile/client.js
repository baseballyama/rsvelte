import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'active',
	'processing',
	'deviceId',
	'barWidth',
	'barGap',
	'barRadius',
	'barColor',
	'fadeEdges',
	'fadeWidth',
	'barHeight',
	'height',
	'sensitivity',
	'smoothingTimeConstant',
	'fftSize',
	'historySize',
	'updateRate',
	'mode',
	'onError',
	'onStreamReady',
	'onStreamEnd',
	'class'
]);

var root = $.from_html(`<div class="absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dotted border-muted-foreground/20"></div>`);
var root_1 = $.from_html(`<div><!> <canvas class="block h-full w-full" aria-hidden="true"></canvas></div>`);

export default function Live_waveform($$anchor, $$props) {
	$.push($$props, true);

	let active = $.prop($$props, 'active', 3, false),
		processing = $.prop($$props, 'processing', 3, false),
		barWidth = $.prop($$props, 'barWidth', 3, 3),
		barGap = $.prop($$props, 'barGap', 3, 1),
		barRadius = $.prop($$props, 'barRadius', 3, 1.5),
		fadeEdges = $.prop($$props, 'fadeEdges', 3, true),
		fadeWidth = $.prop($$props, 'fadeWidth', 3, 24),
		baseBarHeight = $.prop($$props, 'barHeight', 3, 4),
		height = $.prop($$props, 'height', 3, 64),
		sensitivity = $.prop($$props, 'sensitivity', 3, 1),
		smoothingTimeConstant = $.prop($$props, 'smoothingTimeConstant', 3, 0.8),
		fftSize = $.prop($$props, 'fftSize', 3, 256),
		historySize = $.prop($$props, 'historySize', 3, 60),
		updateRate = $.prop($$props, 'updateRate', 3, 30),
		mode = $.prop($$props, 'mode', 3, "static"),
		restProps = $.rest_props($$props, rest_excludes);

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
	const heightStyle = $.derived(() => typeof height() === "number" ? `${height()}px` : height());

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

	// Handle processing animation (when not active but processing)
	$.user_effect(() => {
		if (processing() && !active()) {
			let time = 0;

			transitionProgress = 0;

			const animateProcessing = () => {
				time += 0.03;
				transitionProgress = Math.min(1, transitionProgress + 0.02);

				const processingData = [];
				const barCount = Math.floor((containerRef?.getBoundingClientRect().width || 200) / (barWidth() + barGap()));

				if (mode() === "static") {
					const halfCount = Math.floor(barCount / 2);

					for (let i = 0; i < barCount; i++) {
						const normalizedPosition = (i - halfCount) / halfCount;
						const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4;
						const wave1 = Math.sin(time * 1.5 + normalizedPosition * 3) * 0.25;
						const wave2 = Math.sin(time * 0.8 - normalizedPosition * 2) * 0.2;
						const wave3 = Math.cos(time * 2 + normalizedPosition) * 0.15;
						const combinedWave = wave1 + wave2 + wave3;
						const processingValue = (0.2 + combinedWave) * centerWeight;
						let finalValue = processingValue;

						if (lastActiveData.length > 0 && transitionProgress < 1) {
							const lastDataIndex = Math.min(i, lastActiveData.length - 1);
							const lastValue = lastActiveData[lastDataIndex] || 0;

							finalValue = lastValue * (1 - transitionProgress) + processingValue * transitionProgress;
						}

						processingData.push(Math.max(0.05, Math.min(1, finalValue)));
					}
				} else {
					for (let i = 0; i < barCount; i++) {
						const normalizedPosition = (i - barCount / 2) / (barCount / 2);
						const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4;
						const wave1 = Math.sin(time * 1.5 + i * 0.15) * 0.25;
						const wave2 = Math.sin(time * 0.8 - i * 0.1) * 0.2;
						const wave3 = Math.cos(time * 2 + i * 0.05) * 0.15;
						const combinedWave = wave1 + wave2 + wave3;
						const processingValue = (0.2 + combinedWave) * centerWeight;
						let finalValue = processingValue;

						if (lastActiveData.length > 0 && transitionProgress < 1) {
							const lastDataIndex = Math.floor(i / barCount * lastActiveData.length);
							const lastValue = lastActiveData[lastDataIndex] || 0;

							finalValue = lastValue * (1 - transitionProgress) + processingValue * transitionProgress;
						}

						processingData.push(Math.max(0.05, Math.min(1, finalValue)));
					}
				}

				if (mode() === "static") {
					staticBars = processingData;
				} else {
					history = processingData;
				}

				needsRedraw = true;
				processingAnimationId = requestAnimationFrame(animateProcessing);
			};

			animateProcessing();

			return () => {
				if (processingAnimationId) {
					cancelAnimationFrame(processingAnimationId);
				}
			};
		} else if (!active() && !processing()) {
			// Fade to idle
			const hasData = mode() === "static" ? staticBars.length > 0 : history.length > 0;

			if (hasData) {
				let fadeProgress = 0;

				const fadeToIdle = () => {
					fadeProgress += 0.03;

					if (fadeProgress < 1) {
						if (mode() === "static") {
							staticBars = staticBars.map((value) => value * (1 - fadeProgress));
						} else {
							history = history.map((value) => value * (1 - fadeProgress));
						}

						needsRedraw = true;
						requestAnimationFrame(fadeToIdle);
					} else {
						if (mode() === "static") {
							staticBars = [];
						} else {
							history = [];
						}
					}
				};

				fadeToIdle();
			}
		}
	});

	// Handle microphone setup and teardown
	$.user_effect(() => {
		if (!active()) {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
				stream = null;
				$$props.onStreamEnd?.();
			}

			if (audioContext && audioContext.state !== "closed") {
				audioContext.close();
				audioContext = null;
			}

			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = 0;
			}

			return;
		}

		const setupMicrophone = async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					audio: $$props.deviceId
						? {
							deviceId: { exact: $$props.deviceId },
							echoCancellation: true,
							noiseSuppression: true,
							autoGainControl: true
						}
						: {
							echoCancellation: true,
							noiseSuppression: true,
							autoGainControl: true
						}
				});

				$$props.onStreamReady?.(stream);

				const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

				audioContext = new AudioContextConstructor();
				analyser = audioContext.createAnalyser();
				analyser.fftSize = fftSize();
				analyser.smoothingTimeConstant = smoothingTimeConstant();

				const source = audioContext.createMediaStreamSource(stream);

				source.connect(analyser);

				// Clear history when starting
				history = [];
			} catch(error) {
				$$props.onError?.(error);
			}
		};

		setupMicrophone();

		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
				stream = null;
				$$props.onStreamEnd?.();
			}

			if (audioContext && audioContext.state !== "closed") {
				audioContext.close();
				audioContext = null;
			}

			if (animationId) {
				cancelAnimationFrame(animationId);
				animationId = 0;
			}
		};
	});

	// Animation loop
	$.user_effect(() => {
		if (!canvasRef) return;

		const ctx = canvasRef.getContext("2d");

		if (!ctx) return;

		let rafId;

		const animate = (currentTime) => {
			const rect = canvasRef.getBoundingClientRect();

			// Update audio data if active
			if (active() && currentTime - lastUpdate > updateRate()) {
				lastUpdate = currentTime;

				if (analyser) {
					const dataArray = new Uint8Array(analyser.frequencyBinCount);

					analyser.getByteFrequencyData(dataArray);

					if (mode() === "static") {
						// For static mode, update bars in place
						const startFreq = Math.floor(dataArray.length * 0.05);

						const endFreq = Math.floor(dataArray.length * 0.4);
						const relevantData = dataArray.slice(startFreq, endFreq);
						const barCount = Math.floor(rect.width / (barWidth() + barGap()));
						const halfCount = Math.floor(barCount / 2);
						const newBars = [];

						// Mirror the data for symmetric display
						for (let i = halfCount - 1; i >= 0; i--) {
							const dataIndex = Math.floor(i / halfCount * relevantData.length);
							const value = Math.min(1, relevantData[dataIndex] / 255 * sensitivity());

							newBars.push(Math.max(0.05, value));
						}

						for (let i = 0; i < halfCount; i++) {
							const dataIndex = Math.floor(i / halfCount * relevantData.length);
							const value = Math.min(1, relevantData[dataIndex] / 255 * sensitivity());

							newBars.push(Math.max(0.05, value));
						}

						staticBars = newBars;
						lastActiveData = newBars;
					} else {
						// Scrolling mode - original behavior
						let sum = 0;

						const startFreq = Math.floor(dataArray.length * 0.05);
						const endFreq = Math.floor(dataArray.length * 0.4);
						const relevantData = dataArray.slice(startFreq, endFreq);

						for (let i = 0; i < relevantData.length; i++) {
							sum += relevantData[i];
						}

						const average = sum / relevantData.length / 255 * sensitivity();

						// Add to history
						history.push(Math.min(1, Math.max(0.05, average)));

						lastActiveData = [...history];

						// Maintain history size
						if (history.length > historySize()) {
							history.shift();
						}
					}

					needsRedraw = true;
				}
			}

			// Only redraw if needed
			if (!needsRedraw && !active()) {
				rafId = requestAnimationFrame(animate);

				return;
			}

			needsRedraw = active();
			ctx.clearRect(0, 0, rect.width, rect.height);

			const computedBarColor = $$props.barColor || (() => {
				const style = getComputedStyle(canvasRef);
				const color = style.color;

				return color || "#000";
			})();

			const step = barWidth() + barGap();
			const barCount = Math.floor(rect.width / step);
			const centerY = rect.height / 2;

			// Draw bars based on mode
			if (mode() === "static") {
				const dataToRender = processing()
					? staticBars
					: active() ? staticBars : staticBars.length > 0 ? staticBars : [];

				for (let i = 0; i < barCount && i < dataToRender.length; i++) {
					const value = dataToRender[i] || 0.1;
					const x = i * step;
					const barHeightCalc = Math.max(baseBarHeight(), value * rect.height * 0.8);
					const y = centerY - barHeightCalc / 2;

					ctx.fillStyle = computedBarColor;
					ctx.globalAlpha = 0.4 + value * 0.6;

					if (barRadius() > 0) {
						ctx.beginPath();
						ctx.roundRect(x, y, barWidth(), barHeightCalc, barRadius());
						ctx.fill();
					} else {
						ctx.fillRect(x, y, barWidth(), barHeightCalc);
					}
				}
			} else {
				// Scrolling mode
				for (let i = 0; i < barCount && i < history.length; i++) {
					const dataIndex = history.length - 1 - i;
					const value = history[dataIndex] || 0.1;
					const x = rect.width - (i + 1) * step;
					const barHeightCalc = Math.max(baseBarHeight(), value * rect.height * 0.8);
					const y = centerY - barHeightCalc / 2;

					ctx.fillStyle = computedBarColor;
					ctx.globalAlpha = 0.4 + value * 0.6;

					if (barRadius() > 0) {
						ctx.beginPath();
						ctx.roundRect(x, y, barWidth(), barHeightCalc, barRadius());
						ctx.fill();
					} else {
						ctx.fillRect(x, y, barWidth(), barHeightCalc);
					}
				}
			}

			// Apply edge fading
			if (fadeEdges() && fadeWidth() > 0 && rect.width > 0) {
				if (!gradientCache || lastWidth !== rect.width) {
					const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
					const fadePercent = Math.min(0.3, fadeWidth() / rect.width);

					gradient.addColorStop(0, "rgba(255,255,255,1)");
					gradient.addColorStop(fadePercent, "rgba(255,255,255,0)");
					gradient.addColorStop(1 - fadePercent, "rgba(255,255,255,0)");
					gradient.addColorStop(1, "rgba(255,255,255,1)");
					gradientCache = gradient;
					lastWidth = rect.width;
				}

				ctx.globalCompositeOperation = "destination-out";
				ctx.fillStyle = gradientCache;
				ctx.fillRect(0, 0, rect.width, rect.height);
				ctx.globalCompositeOperation = "source-over";
			}

			ctx.globalAlpha = 1;
			rafId = requestAnimationFrame(animate);
		};

		rafId = requestAnimationFrame(animate);

		return () => {
			if (rafId) {
				cancelAnimationFrame(rafId);
			}
		};
	});

	var div = root_1();

	$.attribute_effect(
		div,
		($0) => ({
			class: $0,
			style: `height: ${$.get(heightStyle) ?? ''};`,
			'aria-label': active()
				? "Live audio waveform"
				: processing() ? "Processing audio" : "Audio waveform idle",
			role: 'img',
			...restProps
		}),
		[() => cn("relative h-full w-full", $$props.class)]
	);

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!active() && !processing()) $$render(consequent);
		});
	}

	var canvas = $.sibling(node, 2);

	$.bind_this(canvas, ($$value) => canvasRef = $$value, () => canvasRef);
	$.reset(div);
	$.bind_this(div, ($$value) => containerRef = $$value, () => containerRef);
	$.append($$anchor, div);
	$.pop();
}