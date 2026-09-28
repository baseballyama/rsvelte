import * as $ from 'svelte/internal/server';
import { PieChart } from 'layerchart';
import { longData } from '$lib/utils/data';

import {
	schemeAccent,
	schemeCategory10,
	schemeDark2,
	schemePaired,
	schemePastel1,
	schemePastel2,
	schemeSet1,
	schemeSet2,
	schemeSet3,
	schemeTableau10
} from 'd3-scale-chromatic';

export default function Color_schemes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const schemes = [
			{ label: 'Tableau10', value: schemeTableau10 },
			{ label: 'Accent', value: schemeAccent },
			{ label: 'Category10', value: schemeCategory10 },
			{ label: 'Dark2', value: schemeDark2 },
			{ label: 'Paired', value: schemePaired },
			{ label: 'Pastel1', value: schemePastel1 },
			{ label: 'Pastel2', value: schemePastel2 },
			{ label: 'Set1', value: schemeSet1 },
			{ label: 'Set2', value: schemeSet2 },
			{ label: 'Set3', value: schemeSet3 }
		];

		const data = longData.filter((d) => d.year === 2019);
		let selectedScheme = undefined;

		$$renderer.select({ class: 'w-50 p-2 border rounded', value: selectedScheme }, ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(schemes);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let scheme = each_array[$$index];

				$$renderer.option({ value: scheme.value }, ($$renderer) => {
					$$renderer.push(`${$.escape(scheme.label)}`);
				});
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(` `);

		PieChart($$renderer, {
			data,
			key: 'fruit',
			value: 'value',
			height: 300,
			cRange: selectedScheme
		});

		$$renderer.push(`<!---->`);
	});
}