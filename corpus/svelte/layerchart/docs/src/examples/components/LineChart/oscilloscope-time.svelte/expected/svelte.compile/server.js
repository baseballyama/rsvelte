import * as $ from 'svelte/internal/server';
import { LinearGradient, LineChart, Highlight, Spline, Tooltip } from 'layerchart';
import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';
import { extent, ticks } from 'd3-array';
import { format } from '@layerstack/utils';
import { scaleSequential } from 'd3-scale';
import { interpolateRainbow } from 'd3-scale-chromatic';

export default function Oscilloscope_time($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const FFT_SIZE = 1024;

		// Generate mock time domain data for demonstration
		const mockData = Array.from({ length: 512 }, (_, i) => ({
			key: i,
			value: 128 + 256 * Math.sin(i / 512 * Math.PI * 8) + 128 * Math.sin(i / 512 * Math.PI * 16)
		}));

		let data = [];
		let audioContext = null;
		let analyser = null;
		let dataArray = null;
		let animationId = null;
		let isListening = false;
		let error = '';
		const valueColor = $.derived(() => scaleSequential(extent(data, (d) => d.value), interpolateRainbow));

		async function startMicrophone() {
			try {
				error = '';

				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

				audioContext = new AudioContext();
				analyser = audioContext.createAnalyser();
				analyser.fftSize = FFT_SIZE;

				const source = audioContext.createMediaStreamSource(stream);

				source.connect(analyser);

				const bufferLength = analyser.fftSize;

				dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
				isListening = true;
				updateTimeData();
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

		function updateTimeData() {
			if (!analyser || !dataArray) return;

			analyser.getByteTimeDomainData(dataArray);

			const amplification = 8;
			const centerValue = 128;

			data = Array.from(dataArray, (value, i) => ({
				key: i,
				value: centerValue + (value - centerValue) * amplification
			}));

			animationId = requestAnimationFrame(updateTimeData);
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
							Spline($$renderer, { stroke: gradient });
						}

						LinearGradient($$renderer, {
							stops: ticks(1, 0, 10).map(valueColor().interpolator()),
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}
				}

				function highlight($$renderer, { context }) {
					if (context.tooltip.data) {
						$$renderer.push('<!--[0-->');

						Highlight($$renderer, {
							lines: true,
							points: { fill: valueColor()(context.y(context.tooltip.data)) }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				function tooltip($$renderer, { context }) {
					{
						function children($$renderer, { data }) {
							const value = context.y(data);

							if (Tooltip.Header) {
								$$renderer.push('<!--[-->');

								Tooltip.Header($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(format(context.x(data)))}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Tooltip.List) {
								$$renderer.push('<!--[-->');

								Tooltip.List($$renderer, {
									children: ($$renderer) => {
										if (Tooltip.Item) {
											$$renderer.push('<!--[-->');
											Tooltip.Item($$renderer, { label: 'value', value, color: valueColor()(value) });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						if (Tooltip.Root) {
							$$renderer.push('<!--[-->');
							Tooltip.Root($$renderer, { children, $$slots: { default: true } });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}

				LineChart($$renderer, {
					data,
					x: 'key',
					y: 'value',
					yDomain: [-256, 512],
					axis: 'y',
					grid: false,
					height: 200,
					marks,
					highlight,
					tooltip,
					$$slots: { marks: true, highlight: true, tooltip: true }
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