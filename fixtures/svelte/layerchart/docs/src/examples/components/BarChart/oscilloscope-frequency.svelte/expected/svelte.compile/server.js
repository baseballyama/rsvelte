import * as $ from 'svelte/internal/server';
import { BarChart, Bars, LinearGradient, defaultChartPadding } from 'layerchart';
import { range, ticks } from 'd3-array';
import { scaleLinear, scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';

export default function Oscilloscope_frequency($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const FFT_SIZE = 256;
		const BIN_COUNT = Math.round(FFT_SIZE / 2 * 0.7);

		// Generate mock frequency domain data for demonstration
		const mockData = Array.from({ length: BIN_COUNT }, (_, i) => ({ key: i, value: Math.max(0, 160 - i * 2 + 40 * Math.random()) }));

		let data = [];
		let audioContext = null;
		let analyser = null;
		let dataArray = null;
		let animationId = null;
		let isListening = false;
		let error = '';
		const decibels = scaleLinear().domain([0, 255]).range([-100, -30]);
		const colorScale = scaleSequential([0, 256], interpolateTurbo);

		async function startMicrophone() {
			try {
				error = '';

				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

				audioContext = new AudioContext();
				analyser = audioContext.createAnalyser();
				analyser.fftSize = FFT_SIZE;

				const source = audioContext.createMediaStreamSource(stream);

				source.connect(analyser);

				const bufferLength = analyser.frequencyBinCount;

				dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
				isListening = true;
				updateFrequencyData();
			} catch(err) {
				error = err instanceof Error ? err.message : 'Failed to access microphone';
				console.error('Error accessing microphone:', err);
			}
		}

		function stopMicrophone() {
			if (animationId !== null) {
				cancelAnimationFrame(animationId);
				animationId = null;
			}

			if (audioContext) {
				audioContext.close();
				audioContext = null;
			}

			analyser = null;
			dataArray = null;
			isListening = false;
			data = [];
		}

		function updateFrequencyData() {
			if (!analyser || !dataArray) return;

			analyser.getByteFrequencyData(dataArray);
			data = Array.from(dataArray.slice(0, BIN_COUNT), (value, i) => ({ key: i, value }));
			animationId = requestAnimationFrame(updateFrequencyData);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			OscilloscopeField($$renderer, {
				startMicrophone,
				stopMicrophone,
				get isListening() {
					return isListening;
				},

				set isListening($$value) {
					isListening = $$value;
					$$settled = false;
				},

				get error() {
					return error;
				},

				set error($$value) {
					error = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			{
				function marks($$renderer) {
					{
						function children($$renderer, { gradient }) {
							Bars($$renderer, { radius: 1, fill: gradient });
						}

						LinearGradient($$renderer, {
							stops: ticks(1, 0, 10).map(colorScale.interpolator()),
							vertical: true,
							units: 'userSpaceOnUse',
							children,
							$$slots: { default: true }
						});
					}
				}

				BarChart($$renderer, {
					data,
					x: 'key',
					xDomain: range(0, BIN_COUNT),
					y: 'value',
					yDomain: [0, 256],
					bandPadding: 0.2,
					rule: false,
					axis: 'y',
					tooltipContext: { mode: 'manual' },
					props: { yAxis: { format: (d) => decibels(d)?.toFixed(1) } },
					padding: defaultChartPadding({ left: 40 }),
					height: 200,
					marks,
					$$slots: { marks: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}