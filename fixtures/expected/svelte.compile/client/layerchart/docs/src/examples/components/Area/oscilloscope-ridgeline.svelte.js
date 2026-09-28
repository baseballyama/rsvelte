import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Area, Axis, Chart, Group, Layer } from 'layerchart';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { curveBasis } from 'd3-shape';
import { Field, RangeField, Switch } from 'svelte-ux';
import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';

var root = $.from_html(`<div class="flex gap-4 mb-4"><!> <!> <!> <!></div> <!> <!>`, 1);

export default function Oscilloscope_ridgeline($$anchor, $$props) {
	$.push($$props, true);

	const FFT_SIZE = 512;
	const HISTORY_SIZE = 12;
	const UPDATE_INTERVAL = 6; // capture every N animation frames (~100ms at 60fps)

	function makeMockFrame(seed) {
		const amp = 50 + 40 * Math.sin(seed * 0.5);

		return Array.from({ length: FFT_SIZE }, (_, i) => ({
			key: i,
			// Absolute deviation from center — creates organic ridge shapes
			value: Math.max(0, amp * Math.abs(Math.sin(i / FFT_SIZE * Math.PI * 6 * (1 + seed * 0.05))) + 15 * Math.random())
		}));
	}

	const mockHistory = Array.from({ length: HISTORY_SIZE }, (_, i) => makeMockFrame(i));
	let history = $.state($.proxy([...mockHistory]));
	let audioContext = $.state(null);
	let analyser = $.state(null);
	let dataArray = $.state(null);
	let animationId = $.state(null);
	let isListening = $.state(false);
	let error = $.state('');
	let frameCount = 0;
	let overlap = $.state(2);
	let height = $.state(400);
	let gain = $.state(4);
	let opaque = $.state(false);
	const N = HISTORY_SIZE;
	const colorScale = scaleSequential([0, N - 1], interpolateTurbo);
	const basePadding = { top: 20, bottom: 10, left: 10, right: 10 };
	const overlapExtra = $.derived(() => Math.max(0, $.get(overlap) - 1));
	const paddingTop = $.derived(() => (N * basePadding.top + $.get(overlapExtra) * ($.get(height) - basePadding.bottom)) / (N + $.get(overlapExtra)));
	const padding = $.derived(() => ({ ...basePadding, top: $.get(paddingTop) }));
	const innerHeight = $.derived(() => $.get(height) - $.get(paddingTop) - basePadding.bottom);
	const step = $.derived(() => $.get(innerHeight) / N);

	// Max negative pixel offset at full amplitude — a plain number so $derived tracks it unambiguously
	const peakHeight = $.derived(() => -$.get(overlap) * $.get(step));

	// Precompute scaled frames; `history`, `peakHeight`, and `gain` are all tracked as dependencies
	const scaledHistory = $.derived(() => $.get(history).map((frame) => frame.map((d) => ({
		key: d.key,
		value: d.value / 128 * $.get(peakHeight) * $.get(gain)
	}))));

	async function startMicrophone() {
		try {
			$.set(error, '');

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			$.set(audioContext, new AudioContext(), true);
			$.set(analyser, $.get(audioContext).createAnalyser(), true);
			$.get(analyser).fftSize = FFT_SIZE;

			const source = $.get(audioContext).createMediaStreamSource(stream);

			source.connect($.get(analyser));
			$.set(dataArray, new Uint8Array(new ArrayBuffer($.get(analyser).fftSize)), true);
			$.set(isListening, true);
			frameCount = 0;
			updateData();
		} catch(err) {
			$.set(error, err instanceof Error ? err.message : 'Failed to access microphone', true);
			console.error('Error accessing microphone:', err);
		}
	}

	function stopMicrophone() {
		if ($.get(animationId) !== null) {
			cancelAnimationFrame($.get(animationId));
			$.set(animationId, null);
		}

		if ($.get(audioContext)) {
			$.get(audioContext).close();
			$.set(audioContext, null);
		}

		$.set(analyser, null);
		$.set(dataArray, null);
		$.set(isListening, false);
		$.set(history, [...mockHistory], true);
	}

	function updateData() {
		if (!$.get(analyser) || !$.get(dataArray)) return;

		frameCount++;

		if (frameCount % UPDATE_INTERVAL === 0) {
			$.get(analyser).getByteTimeDomainData($.get(dataArray));

			// Absolute deviation from center (128) gives upward ridge shapes
			const frame = Array.from($.get(dataArray), (v, i) => ({ key: i, value: Math.abs(v - 128) }));

			// Newest frame at front (top row), oldest dropped
			$.set(history, [frame, ...$.get(history).slice(0, HISTORY_SIZE - 1)], true);
		}

		$.set(animationId, requestAnimationFrame(updateData), true);
	}

	$.user_effect(() => {
		return () => stopMicrophone();
	});

	var $$exports = {
		get data() {
			return $.get(history);
		},

		set data($$value) {
			$.set(history, $.proxy($$value));
		}
	};

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	RangeField(node, {
		label: 'Overlap',
		min: 1,
		max: 12,
		step: 0.5,
		get value() {
			return $.get(overlap);
		},

		set value($$value) {
			$.set(overlap, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	RangeField(node_1, {
		label: 'Height',
		min: 200,
		max: 600,
		step: 50,
		get value() {
			return $.get(height);
		},

		set value($$value) {
			$.set(height, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	RangeField(node_2, {
		label: 'Gain',
		min: 1,
		max: 16,
		step: 0.5,
		get value() {
			return $.get(gain);
		},

		set value($$value) {
			$.set(gain, $$value, true);
		}
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Opaque',
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const id = $.derived(() => $$slotProps.id);

				Switch($$anchor, {
					get id() {
						return $.get(id);
					},
					size: 'md',
					get checked() {
						return $.get(opaque);
					},

					set checked($$value) {
						$.set(opaque, $$value, true);
					}
				});
			}
		}
	});

	$.reset(div);

	var node_4 = $.sibling(div, 2);

	OscilloscopeField(node_4, {
		startMicrophone,
		stopMicrophone,
		get isListening() {
			return $.get(isListening);
		},

		set isListening($$value) {
			$.set(isListening, $$value, true);
		},

		get error() {
			return $.get(error);
		},

		set error($$value) {
			$.set(error, $$value, true);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => [0, $.get(innerHeight)]);

		Chart(node_5, {
			get data() {
				return $.get(scaledHistory)[0];
			},
			x: 'key',
			xDomain: [0, FFT_SIZE - 1],
			y: 'value',
			get yDomain() {
				return $.get($0);
			},
			yRange: ({ height: h }) => [0, h],
			get padding() {
				return $.get(padding);
			},

			get height() {
				return $.get(height);
			},
			tooltipContext: { mode: 'manual' },
			children: ($$anchor, $$slotProps) => {
				Layer($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_6 = $.first_child(fragment_3);

						$.each(node_6, 17, () => $.get(scaledHistory).toReversed(), $.index, ($$anchor, frame, i) => {
							const rowY = $.derived(() => $.get(step) + i * $.get(step));

							Group($$anchor, {
								get y() {
									return $.get(rowY);
								},

								children: ($$anchor, $$slotProps) => {
									Area($$anchor, {
										get data() {
											return $.get(frame);
										},
										x: 'key',
										y0: () => 0,
										y1: (d) => d.value,
										get curve() {
											return curveBasis;
										},
										class: 'fill-surface-100',
										line: { class: 'stroke-surface-content' }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}