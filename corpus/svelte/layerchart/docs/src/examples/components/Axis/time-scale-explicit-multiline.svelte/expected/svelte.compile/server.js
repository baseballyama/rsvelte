import * as $ from 'svelte/internal/server';
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

export default function Time_scale_explicit_multiline($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<div class="grid gap-3"><!--[-->`);

		const each_array = $.ensure_array_like(examples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<div><div class="text-sm mb-1">${$.escape(example.label)}</div> <div class="h-[100px] p-4 border rounded-sm">`);

			Chart($$renderer, {
				xDomain: example.domain,
				padding: defaultChartPadding({ top: 20, bottom: 30, left: 30, right: 30 }),
				children: ($$renderer) => {
					Layer($$renderer, {
						children: ($$renderer) => {
							Axis($$renderer, {
								placement: 'bottom',
								rule: true,
								grid: true,
								tickMultiline: true,
								ticks: { interval: example.interval }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}