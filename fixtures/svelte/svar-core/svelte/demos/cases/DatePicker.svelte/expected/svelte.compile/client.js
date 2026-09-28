import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePicker, Field } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`<div class="demo-box"><h3>Datepicker</h3> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function DatePicker_1($$anchor, $$props) {
	$.push($$props, true);

	const date = new Date(2025, 4, 1);
	const wh = getContext("wx-helpers");

	function showChanges(ev) {
		wh.showNotice({ text: `Date changed to ${ev.value}` });
	}

	function parseDate(string) {
		const p = string.match(/(..)(..)(.+)/);

		return p ? new Date(p.slice(1, 4).join("/")) : null;
	}

	var div = root();
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Wide',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, { dropdown: { width: "100%" }, onchange: showChanges });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Align auto',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, { disabled: true });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Editable (new Date())',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, { editable: true });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Editable custom format (MMDDYYYY)',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, { editable: parseDate, format: "%m%d%Y" });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Align center',
		error: true,
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, { error: true, align: 'center', title: 'Invalid date' });
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Field(node_6, {
		label: 'Without buttons',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, { buttons: false, value: new Date(2022, 4, 10, 16, 0) });
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Field(node_7, {
		label: 'With Today button only',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, { buttons: ["today"], value: new Date(2022, 4, 10, 16, 0) });
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Field(node_8, {
		label: 'Default format',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {
				get value() {
					return date;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Field(node_9, {
		label: 'Custom format',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {
				get value() {
					return date;
				},
				format: '%d %F, %Y'
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Field(node_10, {
		label: 'Custom icon position',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {
				get value() {
					return date;
				},
				css: 'wx-icon-left'
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Field(node_11, {
		label: 'With clear icon',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {
				get value() {
					return date;
				},
				clear: true
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Field(node_12, {
		label: 'Custom clear icon position',
		children: ($$anchor, $$slotProps) => {
			DatePicker($$anchor, {
				get value() {
					return date;
				},
				css: 'wx-icon-left',
				clear: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}