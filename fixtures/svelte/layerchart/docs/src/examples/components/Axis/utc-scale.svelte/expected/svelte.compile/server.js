import * as $ from 'svelte/internal/server';
import { Axis, Chart, Layer } from 'layerchart';
import { scaleUtc } from 'd3-scale';
import { utcDay } from 'd3-time';

export default function Utc_scale($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// A domain on UTC day boundaries — typical of values keyed on a UTC calendar date
		// (ex. daily partitions) rather than on an instant.
		const start = utcDay.floor(new Date());

		const xDomain = [start, utcDay.offset(start, 7)];

		$$renderer.push(`<div class="grid gap-4"><div><div class="text-sm font-semibold">UTC</div> <div class="text-xs text-surface-content/50">\`scaleUtc()\` floors and labels ticks on UTC boundaries, matching the data.</div> `);

		Chart($$renderer, {
			xScale: scaleUtc(),
			xDomain,
			padding: 24,
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							format: { type: 'day', options: { variant: 'short' } },
							rule: true
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div><div class="text-sm font-semibold">Local time</div> <div class="text-xs text-surface-content/50">The default \`scaleTime()\` floors on local boundaries, so over the same domain its ticks sit
			one UTC offset away from each UTC day.</div> `);

		Chart($$renderer, {
			xDomain,
			padding: 24,
			height: 48,
			children: ($$renderer) => {
				Layer($$renderer, {
					children: ($$renderer) => {
						Axis($$renderer, {
							placement: 'bottom',
							format: { type: 'day', options: { variant: 'short' } },
							rule: true
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>`);
	});
}