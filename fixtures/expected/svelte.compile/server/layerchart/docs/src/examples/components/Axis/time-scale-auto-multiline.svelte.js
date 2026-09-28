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
import AxisControls from '$lib/components/controls/AxisControls.svelte';

export default function Time_scale_auto_multiline($$renderer, $$props) {
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

		let tickSpacing = 80; // x-axis default
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AxisControls($$renderer, {
				get value() {
					return tickSpacing;
				},

				set value($$value) {
					tickSpacing = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="grid gap-3"><!--[-->`);

			const each_array = $.ensure_array_like(examples);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let example = each_array[$$index];

				$$renderer.push(`<div><div class="text-sm mb-1">${$.escape(example.label)}</div> <div class="border rounded-sm">`);

				Chart($$renderer, {
					xDomain: example.domain,
					padding: defaultChartPadding({ top: 40, bottom: 40, left: 25, right: 25 }),
					height: 100,
					children: ($$renderer) => {
						Layer($$renderer, {
							children: ($$renderer) => {
								Axis($$renderer, {
									placement: 'top',
									rule: true,
									grid: true,
									tickMultiline: true,
									tickSpacing
								});

								$$renderer.push(`<!----> `);

								Axis($$renderer, {
									placement: 'bottom',
									rule: true,
									grid: true,
									tickMultiline: true,
									tickSpacing
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}