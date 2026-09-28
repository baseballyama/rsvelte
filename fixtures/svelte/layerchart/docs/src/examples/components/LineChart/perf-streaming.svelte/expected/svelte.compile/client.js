import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LineChart } from 'layerchart';

import {
	Button,
	ButtonGroup,
	Field,
	TextField,
	ToggleGroup,
	ToggleOption
} from 'svelte-ux';

import { format } from '@layerstack/utils';
import { AnimationFrames } from 'runed';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-4"><div class="flex gap-3"><!> <!></div> <div class="m-2 flex items-end gap-2"><!> <!> <!> <!> <!></div> <div class="h-[500px] p-4 border rounded-sm"><!></div> </div>`);

export default function Perf_streaming($$anchor, $$props) {
	$.push($$props, true);

	let motion = $.state(true);
	let show = $.state(true);
	let pointsPerFrame = $.state(10);
	let maxLength = $.state(1000);
	let chartData = $.state($.proxy([]));

	function generateDataPoint(referenceDate, valueRange) {
		const value = Math.floor(Math.random() * (valueRange[1] - valueRange[0] + 1)) + valueRange[0];

		return {
			date: new Date(referenceDate),
			value: isFinite(value) ? value : valueRange[0]
		};
	}

	function generateDataPoints(count, startDate, dayIncrement, valueRange) {
		const points = [];

		for (let i = 0; i < count; i++) {
			const date = new Date(startDate.getTime() + i * dayIncrement * 24 * 60 * 60 * 1000);

			if (isNaN(date.getTime())) continue;

			points.push(generateDataPoint(date, valueRange));
		}

		return points;
	}

	const animation = new AnimationFrames(
		() => {
			// Get the latest date from the current data or use the last sample date
			const latestDate = $.get(chartData).length > 0
				? $.get(chartData)[$.get(chartData).length - 1].date
				: new Date('2025-04-07T22:00:00.000Z');

			let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day
			const newPoints = generateDataPoints($.get(pointsPerFrame), nextDate, 1, [0, 100]);

			// Check if we're at or over capacity
			if ($.get(chartData).length + newPoints.length > $.get(maxLength)) {
				// Remove old points and add new points in one operation to maintain buffer size
				$.set(
					chartData,
					[
						...$.get(chartData).slice(-($.get(maxLength) - newPoints.length)),
						...newPoints
					],
					true
				);
			} else {
				// Just push new points
				$.get(chartData).push(...newPoints);
			}

			nextDate = new Date(nextDate.getTime() + $.get(pointsPerFrame) * 24 * 60 * 60 * 1000);
		},
		{ fpsLimit: () => 30, immediate: false }
	);

	function loadRandomData() {
		const latestDate = $.get(chartData).length > 0
			? $.get(chartData)[$.get(chartData).length - 1].date
			: new Date('2025-04-07T22:00:00.000Z');

		let nextDate = new Date(latestDate.getTime() + 24 * 60 * 60 * 1000); // Start from the next day
		const newPoints = generateDataPoints($.get(pointsPerFrame), nextDate, 1, [0, 100]);

		// mutate in place
		$.get(chartData).splice(0, Math.max(0, $.get(chartData).length + newPoints.length - $.get(maxLength)));

		$.get(chartData).push(...newPoints);
		$.set(chartData, $.get(chartData), true);
	}

	// Clear all data
	function clearData() {
		animation.stop();
		$.set(chartData, [], true);
	}

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Field(node, {
		label: 'Motion',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				get value() {
					return $.get(motion);
				},

				set value($$value) {
					$.set(motion, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					ToggleOption(node_1, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Yes');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					ToggleOption(node_2, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('No');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Field(node_3, {
		label: 'Show',
		children: ($$anchor, $$slotProps) => {
			ToggleGroup($$anchor, {
				variant: 'outline',
				get value() {
					return $.get(show);
				},

				set value($$value) {
					$.set(show, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					ToggleOption(node_4, {
						value: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Yes');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					ToggleOption(node_5, {
						value: false,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('No');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_6 = $.child(div_2);

	ButtonGroup(node_6, {
		_size: 'sm',
		variant: 'fill-light',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_7 = $.first_child(fragment_4);

			Button(node_7, {
				onclick: () => animation.start(),
				get disabled() {
					return animation.running;
				},

				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Start');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			{
				let $0 = $.derived(() => !animation.running);

				Button(node_8, {
					onclick: () => animation.stop(),
					get disabled() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Stop');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 2);

	Button(node_9, {
		onclick: () => clearData(),
		variant: 'fill-light',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Clear');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Button(node_10, {
		onclick: () => loadRandomData(),
		variant: 'fill-light',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Load more');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	TextField(node_11, {
		label: 'Frequency (Hz)',
		type: 'integer',
		min: 1,
		step: 100,
		dense: true,
		get value() {
			return $.get(pointsPerFrame);
		},

		set value($$value) {
			$.set(pointsPerFrame, $$value, true);
		}
	});

	var node_12 = $.sibling(node_11, 2);

	TextField(node_12, {
		label: 'Buffer size',
		type: 'integer',
		min: 1,
		step: 4000,
		dense: true,
		get value() {
			return $.get(maxLength);
		},

		set value($$value) {
			$.set(maxLength, $$value, true);
		}
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_13 = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			LineChart($$anchor, {
				x: 'date',
				y: 'value',
				get data() {
					return $.get(chartData);
				},
				brush: true
			});
		};

		$.if(node_13, ($$render) => {
			if ($.get(show) && $.get(chartData).length) $$render(consequent);
		});
	}

	$.reset(div_3);

	var text_8 = $.sibling(div_3);

	$.reset(div);
	$.template_effect(($0) => $.set_text(text_8, ` data: ${$0 ?? ''} points`), [() => format($.get(chartData).length)]);
	$.append($$anchor, div);
	$.pop();
}