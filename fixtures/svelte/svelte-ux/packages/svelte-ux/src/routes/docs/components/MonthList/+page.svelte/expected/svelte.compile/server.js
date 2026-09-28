import * as $ from 'svelte/internal/server';

import {
	addMonths,
	subMonths,
	isSameMonth,
	isAfter,
	startOfQuarter,
	endOfQuarter
} from 'date-fns';

import { MonthList } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selected = null;
		let selectedArr = [];
		let selectedRange = { from: null, to: null };
		let selectedQuarter = { from: null, to: null };

		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Horizontal layout</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-flow-col">`);
				MonthList($$renderer, {});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Vertical layout</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid">`);
				MonthList($$renderer, {});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Auto columns (100px)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">`);
				MonthList($$renderer, {});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>3 columns</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-cols-3">`);
				MonthList($$renderer, {});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Format w/ as name</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]">`);
				MonthList($$renderer, { format: 'MMMM' });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Format w/ as number</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, { format: 'M' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled months w/ single</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, { disabledDates: new Date() });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled months w/ array</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, {
					disabledDates: [
						subMonths(new Date(), 2),
						new Date(),
						addMonths(new Date(), 2)
					]
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled months w/ range</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, {
					disabledDates: { from: subMonths(new Date(), 2), to: addMonths(new Date(), 2) }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled months w/ function</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, { disabledDates: (date) => isAfter(date, new Date()) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected w/ single</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, { selected: new Date() });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected w/ array</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, {
					selected: [
						subMonths(new Date(), 2),
						new Date(),
						addMonths(new Date(), 2)
					]
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected w/ range</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, {
					selected: { from: subMonths(new Date(), 2), to: addMonths(new Date(), 2) }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ single</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, { selected });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ array</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, { selected: selectedArr });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ range</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				MonthList($$renderer, { selected: selectedRange });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Selected state w/ quarter</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid grid-cols-6">`);
				MonthList($$renderer, { selected: selectedQuarter });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}