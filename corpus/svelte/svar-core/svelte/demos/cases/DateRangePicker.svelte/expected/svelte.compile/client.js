import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateRangePicker, Field } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`<div class="demo-box"><h3>DateRangePicker</h3> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function DateRangePicker_1($$anchor, $$props) {
	$.push($$props, true);

	const date = { start: new Date(2020, 1, 1), end: new Date(2021, 3, 3) };
	const wh = getContext("wx-helpers");

	function showChanges(ev) {
		wh.showNotice({ text: `Date changed to ${JSON.stringify(ev.value)}` });
	}

	function parseDate(string) {
		const p = string.match(/(..)(..)(.+)/);

		return p ? new Date(p.slice(1, 4).join("/")) : null;
	}

	var div = root();
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Date range',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				get value() {
					return date;
				},
				onchange: showChanges
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'DateRangePicker with the Done button',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				get value() {
					return date;
				},
				buttons: ["done", "clear", "today"]
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				disabled: true,
				get value() {
					return date;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Editable (new Date())',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				editable: true,
				get value() {
					return date;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Editable, custom format (MMDDYYYY - MMDDYYYY)',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				editable: parseDate,
				get value() {
					return date;
				},
				format: "%m%d%Y"
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Error',
		error: true,
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				error: true,
				get value() {
					return date;
				},
				title: 'Invalid date'
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Field(node_6, {
		label: 'Custom format',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				format: '%d %F, %Y',
				get value() {
					return date;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Field(node_7, {
		label: 'Custom icon position',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				get value() {
					return date;
				},
				css: 'wx-icon-left'
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	Field(node_8, {
		label: 'Single month',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, { months: 1 });
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Field(node_9, {
		label: 'Clear button',
		children: ($$anchor, $$slotProps) => {
			DateRangePicker($$anchor, {
				get value() {
					return date;
				},
				clear: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}