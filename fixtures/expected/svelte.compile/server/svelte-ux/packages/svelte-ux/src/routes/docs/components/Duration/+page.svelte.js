import * as $ from 'svelte/internal/server';
import { subDays, subSeconds } from 'date-fns';
import { Duration } from 'svelte-ux';
import { DurationUnits } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>Examples</h1> <h2>Duration</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid">`);
				Duration($$renderer, { start: new Date() });
				$$renderer.push(`<!----> `);
				Duration($$renderer, { start: new Date(), totalUnits: 1 });
				$$renderer.push(`<!----> `);
				Duration($$renderer, { start: new Date(), totalUnits: 2 });
				$$renderer.push(`<!----> `);

				Duration($$renderer, {
					start: new Date(),
					totalUnits: 2,
					minUnits: DurationUnits.Second
				});

				$$renderer.push(`<!----> `);
				Duration($$renderer, { start: new Date(), minUnits: DurationUnits.Minute });
				$$renderer.push(`<!----> `);
				Duration($$renderer, { start: subSeconds(new Date(), 55), totalUnits: 1 });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Fixed range</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Duration($$renderer, { start: subDays(new Date(), 3), end: subDays(new Date(), 1) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Age</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Duration($$renderer, {
					start: new Date('1982-03-30'),
					totalUnits: 1,
					variant: 'long'
				});

				$$renderer.push(`<!----> old`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Explicit duration</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Duration($$renderer, { duration: { milliseconds: 54321 } });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}