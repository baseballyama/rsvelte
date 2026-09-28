import * as $ from 'svelte/internal/server';
import { DateRangePicker, Field } from "../../src/index";
import { getContext } from "svelte";

export default function DateRangePicker_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const date = { start: new Date(2020, 1, 1), end: new Date(2021, 3, 3) };
		const wh = getContext("wx-helpers");

		function showChanges(ev) {
			wh.showNotice({ text: `Date changed to ${JSON.stringify(ev.value)}` });
		}

		function parseDate(string) {
			const p = string.match(/(..)(..)(.+)/);

			return p ? new Date(p.slice(1, 4).join("/")) : null;
		}

		$$renderer.push(`<div class="demo-box"><h3>DateRangePicker</h3> `);

		Field($$renderer, {
			label: 'Date range',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { value: date, onchange: showChanges });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'DateRangePicker with the Done button',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { value: date, buttons: ["done", "clear", "today"] });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { disabled: true, value: date });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Editable (new Date())',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { editable: true, value: date });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Editable, custom format (MMDDYYYY - MMDDYYYY)',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { editable: parseDate, value: date, format: "%m%d%Y" });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Error',
			error: true,
			children: ($$renderer) => {
				DateRangePicker($$renderer, { error: true, value: date, title: 'Invalid date' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Custom format',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { format: '%d %F, %Y', value: date });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Custom icon position',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { value: date, css: 'wx-icon-left' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Single month',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { months: 1 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Clear button',
			children: ($$renderer) => {
				DateRangePicker($$renderer, { value: date, clear: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}