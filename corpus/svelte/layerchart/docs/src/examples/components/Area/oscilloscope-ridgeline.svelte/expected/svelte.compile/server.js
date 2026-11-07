import * as $ from 'svelte/internal/server';
import { Area, Axis, Chart, Group, Layer } from 'layerchart';
import { scaleSequential } from 'd3-scale';
import { interpolateTurbo } from 'd3-scale-chromatic';
import { curveBasis } from 'd3-shape';
import { Field, RangeField, Switch } from 'svelte-ux';
import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';

export default function Oscilloscope_ridgeline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
		let history = [...mockHistory];
		let audioContext = null;
		let analyser = null;
		let dataArray = null;
		let animationId = null;
		let isListening = false;
		let error = '';
		let frameCount = 0;
		let overlap = 2;
		let height = 400;
		let gain = 4;
		let opaque = false;
		const N = HISTORY_SIZE;
		const colorScale = scaleSequential([0, N - 1], interpolateTurbo);
		const basePadding = { top: 20, bottom: 10, left: 10, right: 10 };
		const overlapExtra = $.derived(() => Math.max(0, overlap - 1));
		const paddingTop = $.derived(() => (N * basePadding.top + overlapExtra() * (height - basePadding.bottom)) / (N + overlapExtra()));
		const padding = $.derived(() => ({ ...basePadding, top: paddingTop() }));
		const innerHeight = $.derived(() => height - paddingTop() - basePadding.bottom);
		const step = $.derived(() => innerHeight() / N);

		// Max negative pixel offset at full amplitude — a plain number so $derived tracks it unambiguously
		const peakHeight = $.derived(() => -overlap * step());

		// Precompute scaled frames; `history`, `peakHeight`, and `gain` are all tracked as dependencies
		const scaledHistory = $.derived(() => history.map((frame) => frame.map((d) => ({ key: d.key, value: d.value / 128 * peakHeight() * gain }))));

		async function startMicrophone() {
			try {
				error = '';

				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

				audioContext = new AudioContext();
				analyser = audioContext.createAnalyser();
				analyser.fftSize = FFT_SIZE;

				const source = audioContext.createMediaStreamSource(stream);

				source.connect(analyser);
				dataArray = new Uint8Array(new ArrayBuffer(analyser.fftSize));
				isListening = true;
				frameCount = 0;
				updateData();
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
			history = [...mockHistory];
		}

		function updateData() {
			if (!analyser || !dataArray) return;

			frameCount++;

			if (frameCount % UPDATE_INTERVAL === 0) {
				analyser.getByteTimeDomainData(dataArray);

				// Absolute deviation from center (128) gives upward ridge shapes
				const frame = Array.from(dataArray, (v, i) => ({ key: i, value: Math.abs(v - 128) }));

				// Newest frame at front (top row), oldest dropped
				history = [frame, ...history.slice(0, HISTORY_SIZE - 1)];
			}

			animationId = requestAnimationFrame(updateData);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex gap-4 mb-4">`);

			RangeField($$renderer, {
				label: 'Overlap',
				min: 1,
				max: 12,
				step: 0.5,
				get value() {
					return overlap;
				},

				set value($$value) {
					overlap = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Height',
				min: 200,
				max: 600,
				step: 50,
				get value() {
					return height;
				},

				set value($$value) {
					height = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			RangeField($$renderer, {
				label: 'Gain',
				min: 1,
				max: 16,
				step: 0.5,
				get value() {
					return gain;
				},

				set value($$value) {
					gain = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Opaque',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, {
							id,
							size: 'md',
							get checked() {
								return opaque;
							},

							set checked($$value) {
								opaque = $$value;
								$$settled = false;
							}
						});
					}
				}
			});

			$$renderer.push(`<!----></div> `);

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

			Chart($$renderer, {
				data: scaledHistory()[0],
				x: 'key',
				xDomain: [0, FFT_SIZE - 1],
				y: 'value',
				yDomain: [0, innerHeight()],
				yRange: ({ height: h }) => [0, h],
				padding: padding(),
				height,
				tooltipContext: { mode: 'manual' },
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(scaledHistory().toReversed());

							for (let i = 0, $$length = each_array.length; i < $$length; i++) {
								let frame = each_array[i];
								const rowY = step() + i * step();

								Group($$renderer, {
									y: rowY,
									children: ($$renderer) => {
										Area($$renderer, {
											data: frame,
											x: 'key',
											y0: () => 0,
											y1: (d) => d.value,
											curve: curveBasis,
											class: 'fill-surface-100',
											line: { class: 'stroke-surface-content' }
										});
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data: history });
	});
}