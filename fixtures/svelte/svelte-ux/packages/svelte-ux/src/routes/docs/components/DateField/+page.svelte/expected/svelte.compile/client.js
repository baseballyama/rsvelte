import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { addDays } from 'date-fns';
import { mdiCalendarStart, mdiCalendarEnd } from '@mdi/js';
import { Button, DateField, getSettings } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid gap-2"><!> <!></div>`);
var root_3 = $.from_html(`<form><!> <!></form>`);
var root_4 = $.from_html(`<h1>Examples</h1> <h2>Playground</h2> <!> <h2>Controlled</h2> <!> <h2>Picker</h2> <!> <h2>Clearable</h2> <!> <h2>Label</h2> <!> <h2>Icon</h2> <!> <h2>Error</h2> <!> <h2>Disabled</h2> <!> <h2>on:change event</h2> <!> <h2>Custom format (ignore Intl settings)</h2> <!> <h2>within form</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $localeSettings = () => $.store_get(localeSettings, '$localeSettings', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { localeSettings } = getSettings();
	let value;
	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			DateField(node_1, {
				label: 'Birth date',
				get value() {
					return value;
				},
				picker: true,
				clearable: true,
				$$events: { change: (e) => value = e.detail.value }
			});

			var text = $.sibling(node_1);

			$.template_effect(() => $.set_text(text, ` value: ${value ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			DateField(node_3, {
				get value() {
					return value;
				}
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				$$events: { click: () => value = new Date() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, $localeSettings().dictionary.Date.PeriodDay.Current));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				$$events: { click: () => value = addDays(new Date(), -1) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, $localeSettings().dictionary.Date.PeriodDay.Last));
					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				$$events: { click: () => value = addDays(new Date(), -7) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, $localeSettings().dictionary.Date.PeriodWeek.Last));
					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				$$events: { click: () => value = addDays(new Date(), 7) },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Next week');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_2, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			DateField($$anchor, {
				get value() {
					return value;
				},
				picker: true,
				$$events: { change: (e) => value = e.detail.value }
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			DateField($$anchor, {
				get value() {
					return value;
				},
				clearable: true,
				$$events: { change: (e) => value = e.detail.value }
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			DateField($$anchor, { label: 'Birth date' });
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node_12 = $.child(div);

			DateField(node_12, {
				label: 'Start date',
				get icon() {
					return mdiCalendarStart;
				}
			});

			var node_13 = $.sibling(node_12, 2);

			DateField(node_13, {
				label: 'End date',
				get icon() {
					return mdiCalendarEnd;
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_11, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			DateField($$anchor, { label: 'Birth date', error: 'This is a required field' });
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			DateField($$anchor, { label: 'Birth date', disabled: true });
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			DateField($$anchor, {
				label: 'Birth date',
				$$events: { change: (e) => console.log(e.detail) }
			});
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root();
			var node_18 = $.first_child(fragment_12);

			DateField(node_18, {
				label: 'Birth date',
				get value() {
					return value;
				},
				picker: true,
				clearable: true,
				format: 'dd/MM/yyyy',
				$$events: { change: (e) => value = e.detail.value }
			});

			var text_5 = $.sibling(node_18);

			$.template_effect(() => $.set_text(text_5, ` value: ${value ?? ''}`));
			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_17, 4);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			var form = root_3();
			var node_20 = $.child(form);

			DateField(node_20, { label: 'Birth date', name: 'birth_date' });

			var node_21 = $.sibling(node_20, 2);

			Button(node_21, {
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Submit');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.reset(form);

			$.event('submit', form, (e) => {
				e.preventDefault();

				// @ts-expect-error
				const formData = new FormData(e.target);

				alert(formData.get('birth_date'));
			});

			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}