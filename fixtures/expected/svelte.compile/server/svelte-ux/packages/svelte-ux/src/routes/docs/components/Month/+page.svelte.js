import * as $ from 'svelte/internal/server';

import {
	addDays,
	subDays,
	isAfter,
	isSameDay,
	startOfWeek,
	endOfWeek,
	addMonths,
	startOfMonth
} from 'date-fns';

import { Month } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selected = null;
		let selectedArr = [];
		let selectedRange = { from: null, to: null };
		let selectedWeek = { from: null, to: null };
		let selectedMultiMonth = { from: null, to: null };

		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Show Outside Days</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { showOutsideDays: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled days w/ single</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { disabledDates: new Date() });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled days w/ array</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, {
					disabledDates: [subDays(new Date(), 2), new Date(), addDays(new Date(), 2)]
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled days w/ range</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, {
					disabledDates: { from: subDays(new Date(), 2), to: addDays(new Date(), 2) }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled days w/ function</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { disabledDates: (date) => isAfter(date, new Date()) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected w/ single</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { selected: new Date() });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected w/ array</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, {
					selected: [subDays(new Date(), 2), new Date(), addDays(new Date(), 2)]
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected w/ range</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, {
					selected: { from: subDays(new Date(), 2), to: addDays(new Date(), 2) }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ single</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { selected });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ array</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { selected: selectedArr });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ range</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { selected: selectedRange });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ week</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Month($$renderer, { selected: selectedWeek });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ multi-month</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-cols-[1fr,1fr] gap-10"><div>`);
				Month($$renderer, { selected: selectedMultiMonth });
				$$renderer.push(`<!----></div> <div>`);

				Month($$renderer, {
					selected: selectedMultiMonth,
					startOfMonth: startOfMonth(addMonths(new Date(), 1))
				});

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}