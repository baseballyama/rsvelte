import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TimePicker, Field, Locale } from "../../src/index";
import { cn } from "@svar-ui/core-locales";

var root = $.from_html(`<div class="demo-box"><h3>TimePicker</h3> <!> <!></div> <div class="demo-box"><h3>TimePicker with a side label</h3> <!> <!> <!></div> <div class="demo-box"><h3>TimePicker with a dropdown that matches the input width</h3> <!></div> <div class="demo-box"><h3>12-hour TimePicker</h3> <!></div> <div class="demo-box"><h3>CN locale</h3> <!></div>`, 1);

export default function TimePicker_1($$anchor) {
	let value = $.state(null);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Initial value',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			TimePicker($$anchor, {
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Default value',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			TimePicker($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.sibling($.child(div_1), 2);

	Field(node_2, {
		label: 'Time',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			TimePicker($$anchor, {
				get value() {
					return $.get(value);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Disabled',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			TimePicker($$anchor, {
				get value() {
					return $.get(value);
				},
				disabled: true
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Error',
		position: 'left',
		error: true,
		children: ($$anchor, $$slotProps) => {
			TimePicker($$anchor, {
				get value() {
					return $.get(value);
				},
				error: true,
				title: 'Invalid option'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_5 = $.sibling($.child(div_2), 2);

	Field(node_5, {
		label: 'Time',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			TimePicker($$anchor, {
				dropdown: { width: "100%" },
				get value() {
					return $.get(value);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.sibling($.child(div_3), 2);

	Locale(node_6, {
		words: {
			formats: { timeFormat: "%g:%i %a" },
			calendar: { clockFormat: 12 }
		},

		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				children: ($$anchor, $$slotProps) => {
					TimePicker($$anchor, {
						get value() {
							return $.get(value);
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_7 = $.sibling($.child(div_4), 2);

	Locale(node_7, {
		get words() {
			return cn;
		},

		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				children: ($$anchor, $$slotProps) => {
					TimePicker($$anchor, {
						get value() {
							return $.get(value);
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.append($$anchor, fragment);
}