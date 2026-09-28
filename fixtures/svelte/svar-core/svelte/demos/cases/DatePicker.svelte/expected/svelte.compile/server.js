import * as $ from 'svelte/internal/server';
import { DatePicker, Field } from "../../src/index";
import { getContext } from "svelte";

export default function DatePicker_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const date = new Date(2025, 4, 1);
		const wh = getContext("wx-helpers");

		function showChanges(ev) {
			wh.showNotice({ text: `Date changed to ${ev.value}` });
		}

		function parseDate(string) {
			const p = string.match(/(..)(..)(.+)/);

			return p ? new Date(p.slice(1, 4).join("/")) : null;
		}

		$$renderer.push(`<div class="demo-box"><h3>Datepicker</h3> `);

		Field($$renderer, {
			label: 'Wide',
			children: ($$renderer) => {
				DatePicker($$renderer, { dropdown: { width: "100%" }, onchange: showChanges });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Align auto',
			children: ($$renderer) => {
				DatePicker($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			children: ($$renderer) => {
				DatePicker($$renderer, { disabled: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Editable (new Date())',
			children: ($$renderer) => {
				DatePicker($$renderer, { editable: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Editable custom format (MMDDYYYY)',
			children: ($$renderer) => {
				DatePicker($$renderer, { editable: parseDate, format: "%m%d%Y" });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Align center',
			error: true,
			children: ($$renderer) => {
				DatePicker($$renderer, { error: true, align: 'center', title: 'Invalid date' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Without buttons',
			children: ($$renderer) => {
				DatePicker($$renderer, { buttons: false, value: new Date(2022, 4, 10, 16, 0) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'With Today button only',
			children: ($$renderer) => {
				DatePicker($$renderer, { buttons: ["today"], value: new Date(2022, 4, 10, 16, 0) });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Default format',
			children: ($$renderer) => {
				DatePicker($$renderer, { value: date });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Custom format',
			children: ($$renderer) => {
				DatePicker($$renderer, { value: date, format: '%d %F, %Y' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Custom icon position',
			children: ($$renderer) => {
				DatePicker($$renderer, { value: date, css: 'wx-icon-left' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'With clear icon',
			children: ($$renderer) => {
				DatePicker($$renderer, { value: date, clear: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Custom clear icon position',
			children: ($$renderer) => {
				DatePicker($$renderer, { value: date, css: 'wx-icon-left', clear: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}