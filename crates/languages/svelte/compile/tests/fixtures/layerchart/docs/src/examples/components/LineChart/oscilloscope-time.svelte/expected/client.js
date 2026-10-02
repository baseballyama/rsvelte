import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LinearGradient, LineChart, Highlight, Spline, Tooltip } from 'layerchart';
import OscilloscopeField from '$lib/components/controls/fields/OscilloscopeField.svelte';
import { extent, ticks } from 'd3-array';
import { format } from '@layerstack/utils';
import { scaleSequential } from 'd3-scale';
import { interpolateRainbow } from 'd3-scale-chromatic';

var root = $.from_html(`<!> <!>`, 1);

export default function Oscilloscope_time($$anchor, $$props) {
	$.push($$props, true);

	const FFT_SIZE = 1024;

	// Generate mock time domain data for demonstration
	const mockData = Array.from({ length: 512 }, (_, i) => ({
		key: i,
		value: 128 + 256 * Math.sin(i / 512 * Math.PI * 8) + 128 * Math.sin(i / 512 * Math.PI * 16)
	}));

	let data = $.state($.proxy([]));
	let audioContext = $.state(null);
	let analyser = $.state(null);
	let dataArray = $.state(null);
	let animationId = $.state(null);
	let isListening = $.state(false);
	let error = $.state('');
	const valueColor = $.derived(() => scaleSequential(extent($.get(data), (d) => d.value), interpolateRainbow));

	$.user_effect(() => {
		if (!$.get(isListening)) {
			$.set(data, mockData, true);
		}
	});

	async function startMicrophone() {
		try {
			$.set(error, '');

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			$.set(audioContext, new AudioContext(), true);
			$.set(analyser, $.get(audioContext).createAnalyser(), true);
			$.get(analyser).fftSize = FFT_SIZE;

			const source = $.get(audioContext).createMediaStreamSource(stream);

			source.connect($.get(analyser));

			const bufferLength = $.get(analyser).fftSize;

			$.set(dataArray, new Uint8Array(new ArrayBuffer(bufferLength)), true);
			$.set(isListening, true);
			updateTimeData();
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

	function updateTimeData() {
		if (!$.get(analyser) || !$.get(dataArray)) return;

		$.get(analyser).getByteTimeDomainData($.get(dataArray));

		const amplification = 8;
		const centerValue = 128;

		$.set(
			data,
			Array.from($.get(dataArray), (value, i) => ({
				key: i,
				value: centerValue + (value - centerValue) * amplification
			})),
			true
		);

		$.set(animationId, requestAnimationFrame(updateTimeData), true);
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

					Spline($$anchor, {
						get stroke() {
							return gradient();
						}
					});
				};

				let $0 = $.derived(() => ticks(1, 0, 10).map($.get(valueColor).interpolator()));

				LinearGradient($$anchor, {
					get stops() {
						return $.get($0);
					},
					vertical: true,
					children,
					$$slots: { default: true }
				});
			}
		};

		const highlight = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => ({ fill: $.get(valueColor)(context().y(context().tooltip.data)) }));

						Highlight($$anchor, {
							lines: true,
							get points() {
								return $.get($0);
							}
						});
					}
				};

				$.if(node_2, ($$render) => {
					if (context().tooltip.data) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_3);
		};

		const tooltip = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;
			var fragment_5 = $.comment();
			var node_3 = $.first_child(fragment_5);

			{
				const children = ($$anchor, $$arg0) => {
					let data = () => ($$arg0?.()).data;
					const value = $.derived(() => context().y(data()));
					var fragment_6 = root();
					var node_4 = $.first_child(fragment_6);

					$.component(node_4, () => Tooltip.Header, ($$anchor, Tooltip_Header) => {
						Tooltip_Header($$anchor, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(($0) => $.set_text(text, $0), [() => format(context().x(data()))]);
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => Tooltip.List, ($$anchor, Tooltip_List) => {
						Tooltip_List($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = $.comment();
								var node_6 = $.first_child(fragment_8);

								{
									let $0 = $.derived(() => $.get(valueColor)($.get(value)));

									$.component(node_6, () => Tooltip.Item, ($$anchor, Tooltip_Item) => {
										Tooltip_Item($$anchor, {
											label: 'value',
											get value() {
												return $.get(value);
											},

											get color() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				$.component(node_3, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, { children, $$slots: { default: true } });
				});
			}

			$.append($$anchor, fragment_5);
		};

		LineChart(node_1, {
			get data() {
				return $.get(data);
			},
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

	$.append($$anchor, fragment);

	return $.pop($$exports);
}