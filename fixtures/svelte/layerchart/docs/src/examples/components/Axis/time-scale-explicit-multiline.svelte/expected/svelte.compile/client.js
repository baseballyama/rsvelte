import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Axis, Chart, Layer, defaultChartPadding } from 'layerchart';

import {
	timeDay,
	timeHour,
	timeMillisecond,
	timeMinute,
	timeMonth,
	timeSecond,
	timeYear
} from 'd3-time';

import { startOfInterval } from '@layerstack/utils';

var root = $.from_html(`<div><div class="text-sm mb-1"> </div> <div class="h-[100px] p-4 border rounded-sm"><!></div></div>`);
var root_1 = $.from_html(`<div class="grid gap-3"></div>`);

export default function Time_scale_explicit_multiline($$anchor, $$props) {
	$.push($$props, true);

	const today = startOfInterval('day', new Date());

	const examples = [
		{
			label: '5 years',
			domain: [timeYear.offset(today, -5), today],
			interval: timeYear.every(1),
			format: 'year'
		},

		{
			label: '1 year',
			domain: [timeYear.offset(today, -1), today],
			interval: timeMonth.every(1),
			format: { type: 'month', options: { variant: 'short' } }
		},

		{
			label: '6 months',
			domain: [timeMonth.offset(today, -6), today],
			interval: timeMonth.every(1),
			format: { type: 'month', options: { variant: 'short' } }
		},

		{
			label: '90 days',
			domain: [timeDay.offset(today, -90), today],
			interval: timeDay.every(7),
			format: { type: 'day', options: { variant: 'short' } }
		},

		{
			label: '30 days',
			domain: [timeDay.offset(today, -30), today],
			interval: timeDay.every(1),
			format: { type: 'day', options: { variant: 'short' } }
		},

		{
			label: '10 days',
			domain: [timeDay.offset(today, -10), today],
			interval: timeDay.every(1),
			format: { type: 'day', options: { variant: 'short' } }
		},

		{
			label: '7 days',
			domain: [timeDay.offset(today, -7), today],
			interval: timeDay.every(1),
			format: { type: 'day', options: { variant: 'short' } }
		},

		{
			label: '3 days',
			domain: [timeDay.offset(today, -3), today],
			interval: timeHour.every(4),
			format: { type: 'day', options: { variant: 'short' } }
		},

		{
			label: '24 hours',
			domain: [timeHour.offset(today, -24), today],
			interval: timeHour.every(1),
			format: 'hour'
		},

		{
			label: '12 hours',
			domain: [timeHour.offset(today, -12), today],
			interval: timeHour.every(1),
			format: 'hour'
		},

		{
			label: '1 hour',
			domain: [timeHour.offset(today, -1), today],
			interval: timeMinute.every(5),
			format: 'minute'
		},

		{
			label: '1 minute',
			domain: [timeMinute.offset(today, -1), today],
			interval: timeSecond.every(10),
			format: 'second'
		},

		{
			label: '1 second',
			domain: [timeSecond.offset(today, -1), today],
			interval: timeMillisecond.every(100),
			format: 'millisecond'
		}
	];

	var div = root_1();

	$.each(div, 21, () => examples, $.index, ($$anchor, example) => {
		var div_1 = root();
		var div_2 = $.child(div_1);
		var text = $.only_child(div_2, true);
		var div_3 = $.sibling(div_2, 2);
		var node = $.child(div_3);

		{
			let $0 = $.derived(() => defaultChartPadding({ top: 20, bottom: 30, left: 30, right: 30 }));

			Chart(node, {
				get xDomain() {
					return $.get(example).domain;
				},

				get padding() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					Layer($$anchor, {
						children: ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => ({ interval: $.get(example).interval }));

								Axis($$anchor, {
									placement: 'bottom',
									rule: true,
									grid: true,
									tickMultiline: true,
									get ticks() {
										return $.get($0);
									}
								});
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		}

		$.reset(div_3);
		$.reset(div_1);
		$.template_effect(() => $.set_text(text, $.get(example).label));
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}