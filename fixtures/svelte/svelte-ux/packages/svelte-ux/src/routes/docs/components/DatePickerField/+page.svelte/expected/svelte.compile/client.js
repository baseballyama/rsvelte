import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiCalendar } from '@mdi/js';
import { Button, DatePickerField } from 'svelte-ux';
import { PeriodType } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<form><!> <!></form>`);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Controlled</h2> <!> <h2>Icon</h2> <!> <h2>Label</h2> <!> <h2>Stepper w/ default (day)</h2> <!> <h2>Stepper w/ month</h2> <!> <h2>Stepper w/ rounded</h2> <!> <h2>Stepper w/ rounded & center</h2> <!> <h2>Icon only</h2> <!> <h2>Label only</h2> <!> <h2>Clearable</h2> <!> <h2>within form</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let value = new Date();
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {
				get icon() {
					return mdiCalendar;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {
				label: 'Date of Birth',
				get icon() {
					return mdiCalendar;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {
				stepper: true,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {
				get periodType() {
					return PeriodType.Month;
				},
				stepper: true,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {
				stepper: true,
				rounded: true,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, {
				stepper: true,
				rounded: true,
				center: true,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, { iconOnly: true });
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, { label: 'Start Date' });
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			DatePickerField($$anchor, { label: 'Start Date', clearable: true });
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			var form = root();
			var node_12 = $.child(form);

			DatePickerField(node_12, { label: 'Start Date', name: 'start_date', clearable: true });

			var node_13 = $.sibling(node_12, 2);

			Button(node_13, {
				type: 'submit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Submit');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(form);

			$.event('submit', form, (e) => {
				e.preventDefault();

				// @ts-expect-error
				const formData = new FormData(e.target);

				alert(formData.get('start_date'));
			});

			$.append($$anchor, form);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}