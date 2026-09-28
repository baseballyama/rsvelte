import * as $ from 'svelte/internal/server';
import { addDays } from 'date-fns';
import { mdiCalendarStart, mdiCalendarEnd } from '@mdi/js';
import { Button, DateField, getSettings } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { localeSettings } = getSettings();
		let value;

		$$renderer.push(`<h1>Examples</h1> <h2>Playground</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { label: 'Birth date', value, picker: true, clearable: true });
				$$renderer.push(`<!----> value: ${$.escape(value)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Controlled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { value });
				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$localeSettings', localeSettings).dictionary.Date.PeriodDay.Current)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$localeSettings', localeSettings).dictionary.Date.PeriodDay.Last)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$localeSettings', localeSettings).dictionary.Date.PeriodWeek.Last)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Next week`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Picker</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { value, picker: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Clearable</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { value, clearable: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Label</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { label: 'Birth date' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Icon</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="grid gap-2">`);
				DateField($$renderer, { label: 'Start date', icon: mdiCalendarStart });
				$$renderer.push(`<!----> `);
				DateField($$renderer, { label: 'End date', icon: mdiCalendarEnd });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Error</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { label: 'Birth date', error: 'This is a required field' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Disabled</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { label: 'Birth date', disabled: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>on:change event</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, { label: 'Birth date' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom format (ignore Intl settings)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				DateField($$renderer, {
					label: 'Birth date',
					value,
					picker: true,
					clearable: true,
					format: 'dd/MM/yyyy'
				});

				$$renderer.push(`<!----> value: ${$.escape(value)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>within form</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<form>`);
				DateField($$renderer, { label: 'Birth date', name: 'birth_date' });
				$$renderer.push(`<!----> `);

				Button($$renderer, {
					type: 'submit',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Submit`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></form>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}