import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BarChart, Bars, LinearGradient, defaultChartPadding } from 'layerchart';
import { range, ticks } from 'd3-array';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Oscilloscope_frequency($$anchor, $$props) {
	$.push($$props, true);

	const FFT_SIZE = 256;
	const BIN_COUNT = Math.round(FFT_SIZE / 2 * 0.7);

	// Generate mock frequency domain data for demonstration
	const mockData = Array.from({ length: BIN_COUNT }, (_, i) => ({ key: i, value: Math.max(0, 160 - i * 2 + 40 * Math.random()) }));

	let data = $.state($.proxy([]));
	let audioContext = $.state(null);
	let analyser = $.state(null);
	let dataArray = $.state(null);
	let animationId = $.state(null);
	let isListening = $.state(false);
	let error = $.state('');

	$.user_effect(() => {
		if (!$.get(isListening)) {
			$.set(data, mockData, true);
		}
	});

	const decibels = scaleLinear().domain([0, 255]).range([-100, -30]);
	const colorScale = scaleSequential([0, 256], interpolateTurbo);

	async function startMicrophone() {
		try {
			$.set(error, '');

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			$.set(audioContext, new AudioContext(), true);
			$.set(analyser, $.get(audioContext).createAnalyser(), true);
			$.get(analyser).fftSize = FFT_SIZE;

			const source = $.get(audioContext).createMediaStreamSource(stream);

			source.connect($.get(analyser));

			const bufferLength = $.get(analyser).frequencyBinCount;

			$.set(dataArray, new Uint8Array(new ArrayBuffer(bufferLength)), true);
			$.set(isListening, true);
			updateFrequencyData();
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
		$.set(data, [], true);
	}

	function updateFrequencyData() {
		if (!$.get(analyser) || !$.get(dataArray)) return;

		$.get(analyser).getByteFrequencyData($.get(dataArray));
		$.set(data, Array.from($.get(dataArray).slice(0, BIN_COUNT), (value, i) => ({ key: i, value })), true);
		$.set(animationId, requestAnimationFrame(updateFrequencyData), true);
	}

	$.user_effect(() => {
		return () => {
			stopMicrophone();
		};
	});

	var $$exports = {
		get data() {
			return $.get(data);
		},

		set data($$value) {
			$.set(data, $.proxy($$value));
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	OscilloscopeField(node, {
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

	var node_1 = $.sibling(node, 2);

	{
		const marks = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;

					Bars($$anchor, {
						radius: 1,
						get fill() {
							return gradient();
						}
					});
				};

				let $0 = $.derived(() => ticks(1, 0, 10).map(colorScale.interpolator()));

				LinearGradient($$anchor, {
					get stops() {
						return $.get($0);
					},
					vertical: true,
					units: 'userSpaceOnUse',
					children,
					$$slots: { default: true }
				});
			}
		};

		let $0 = $.derived(() => range(0, BIN_COUNT));
		let $1 = $.derived(() => defaultChartPadding({ left: 40 }));

		BarChart(node_1, {
			get data() {
				return $.get(data);
			},
			x: 'key',
			get xDomain() {
				return $.get($0);
			},
			y: 'value',
			yDomain: [0, 256],
			bandPadding: 0.2,
			rule: false,
			axis: 'y',
			tooltipContext: { mode: 'manual' },
			props: { yAxis: { format: (d) => decibels(d)?.toFixed(1) } },
			get padding() {
				return $.get($1);
			},
			height: 200,
			marks,
			$$slots: { marks: true }
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}