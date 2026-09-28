import * as $ from 'svelte/internal/server';
import { addYears, startOfYear, subYears } from 'date-fns';
import { YearList } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selected = new Date('1982-03-30');

		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				YearList($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				YearList($$renderer, { selected });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected w/ Scroll into view</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="overflow-auto h-64">`);

				YearList($$renderer, {
					minDate: subYears(selected, 10),
					maxDate: addYears(selected, 10),
					selected
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Min / Max date</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				YearList($$renderer, {
					minDate: startOfYear(subYears(new Date(), 3)),
					maxDate: new Date()
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}