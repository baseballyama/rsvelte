import * as $ from 'svelte/internal/server';
import { BarChart } from 'layerchart';
import { getRandomInteger } from '$lib/utils/data.js';
import { Switch } from 'svelte-ux';

export default function Barchart_tickspacing($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const states = [
			'AL',
			'AK',
			'AZ',
			'AR',
			'CA',
			'CO',
			'CT',
			'DE',
			'FL',
			'GA',
			'HI',
			'ID',
			'IL',
			'IN',
			'IA',
			'KS',
			'KY',
			'LA',
			'ME',
			'MD',
			'MA',
			'MI',
			'MN',
			'MS',
			'MO',
			'MT',
			'NE',
			'NV',
			'NH',
			'NJ',
			'NM',
			'NY',
			'NC',
			'ND',
			'OH',
			'OK',
			'OR',
			'PA',
			'RI',
			'SC',
			'SD',
			'TN',
			'TX',
			'UT',
			'VT',
			'VA',
			'WA',
			'WV',
			'WI',
			'WY'
		];

		const data = states.map((state) => ({ state, value: getRandomInteger(20, 100) }));
		let tickSpacing = true;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<label class="flex gap-2 pb-4 screenshot-hidden">`);

			Switch($$renderer, {
				get checked() {
					return tickSpacing;
				},

				set checked($$value) {
					tickSpacing = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> ${$.escape(tickSpacing ? 'Applying tickSpacing' : 'Not applying tickSpacing')}</label> `);

			BarChart($$renderer, {
				data,
				x: 'state',
				y: 'value',
				props: { xAxis: { tickSpacing: tickSpacing ? 80 : null } },
				height: 300
			});

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