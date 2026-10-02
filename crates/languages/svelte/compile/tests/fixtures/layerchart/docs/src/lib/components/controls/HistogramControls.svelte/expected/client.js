import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { NumberStepper, MenuField, RangeField } from 'svelte-ux';
import { timeDay, timeWeek, timeMonth } from 'd3-time';

import {
	randomNormal,
	randomUniform,
	randomInt,
	randomLogNormal,
	randomExponential,
	randomBates
} from 'd3-random';

import { cls } from '@layerstack/tailwind';

var root = $.from_html(`<div><!> <!> <!></div>`);
var root_1 = $.from_html(`<div><!> <!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function HistogramControls($$anchor, $$props) {
	$.push($$props, true);

	let dateRange = $.prop($$props, 'dateRange', 15),
		thresholds = $.prop($$props, 'thresholds', 15),
		interval = $.prop($$props, 'interval', 15),
		random = $.prop($$props, 'random', 15),
		selectedGenerator = $.prop($$props, 'selectedGenerator', 15),
		randomCount = $.prop($$props, 'randomCount', 15);

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					NumberStepper($$anchor, {
						label: 'Date range',
						min: 1,
						class: 'w-40',
						get value() {
							return dateRange();
						},

						set value($$value) {
							dateRange($$value);
						}
					});
				};

				$.if(node_1, ($$render) => {
					if (dateRange() !== undefined) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					RangeField($$anchor, {
						label: 'Thresholds',
						min: 0,
						max: 100,
						class: 'grow',
						get value() {
							return thresholds();
						},

						set value($$value) {
							thresholds($$value);
						}
					});
				};

				$.if(node_2, ($$render) => {
					if (thresholds() !== undefined) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					{
						let $0 = $.derived(() => [
							{ label: 'Days', value: timeDay.range },
							{ label: 'Weeks', value: timeWeek.range },
							{ label: 'Months', value: timeMonth.range }
						]);

						MenuField($$anchor, {
							label: 'Interval',
							get options() {
								return $.get($0);
							},
							stepper: true,
							classes: { menuIcon: 'hidden' },
							get value() {
								return interval();
							},

							set value($$value) {
								interval($$value);
							}
						});
					}
				};

				$.if(node_3, ($$render) => {
					if (interval() !== undefined) $$render(consequent_2);
				});
			}

			$.reset(div);
			$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cls('flex gap-2 mb-4 screenshot-hidden'))]);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (dateRange() !== undefined || thresholds() !== undefined || interval() !== undefined) $$render(consequent_3);
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_1 = root_1();
			var node_5 = $.child(div_1);

			{
				var consequent_4 = ($$anchor) => {
					MenuField($$anchor, {
						label: 'Generator',
						options: [
							{ label: 'normal', value: 'normal' },
							{ label: 'uniform', value: 'uniform' },
							{ label: 'integer', value: 'integer' },
							{ label: 'logNormal', value: 'logNormal' },
							{ label: 'exponential', value: 'exponential' },
							{ label: 'bates', value: 'bates' }
						],

						get value() {
							return selectedGenerator();
						},

						set value($$value) {
							selectedGenerator($$value);
						},

						$$events: {
							change: (e) => {
								switch (e.detail.value) {
									case 'normal':
										random(randomNormal());
										break;

									case 'uniform':
										random(randomUniform());
										break;

									case 'integer':
										random(randomInt(1, 10));
										break;

									case 'logNormal':
										random(randomLogNormal());
										break;

									case 'exponential':
										random(randomExponential(10));
										break;

									case 'bates':
										random(randomBates(10));
										break;
								}
							}
						}
					});
				};

				$.if(node_5, ($$render) => {
					if (selectedGenerator() !== undefined) $$render(consequent_4);
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_5 = ($$anchor) => {
					NumberStepper($$anchor, {
						label: 'Count',
						class: 'w-full',
						get value() {
							return randomCount();
						},

						set value($$value) {
							randomCount($$value);
						}
					});
				};

				$.if(node_6, ($$render) => {
					if (randomCount() !== undefined) $$render(consequent_5);
				});
			}

			$.reset(div_1);

			$.template_effect(($0) => $.set_class(div_1, 1, $0), [
				() => $.clsx(cls('grid grid-cols-[1fr_148px] gap-2 my-2 screenshot-hidden'))
			]);

			$.append($$anchor, div_1);
		};

		$.if(node_4, ($$render) => {
			if (selectedGenerator() !== undefined || randomCount() !== undefined) $$render(consequent_6);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}