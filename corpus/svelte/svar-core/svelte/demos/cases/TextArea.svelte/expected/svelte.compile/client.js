import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TextArea, Field } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3>Area with a top label</h3> <!> <!> <!> <!></div> <div class="demo-box"><h3>Area with a side label</h3> <!></div>`, 1);

export default function TextArea_1($$anchor) {
	let v1 = $.state("");
	let v2 = $.state("");
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Details',
		children: ($$anchor, $$slotProps) => {
			TextArea($$anchor, {
				placeholder: 'Type here',
				get value() {
					return $.get(v1);
				},

				set value($$value) {
					$.set(v1, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			TextArea($$anchor, {
				disabled: true,
				placeholder: 'Type here',
				get value() {
					return $.get(v1);
				},

				set value($$value) {
					$.set(v1, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Readonly',
		children: ($$anchor, $$slotProps) => {
			TextArea($$anchor, {
				readonly: true,
				placeholder: 'Type here',
				get value() {
					return $.get(v1);
				},

				set value($$value) {
					$.set(v1, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Error',
		error: true,
		children: ($$anchor, $$slotProps) => {
			TextArea($$anchor, {
				error: true,
				placeholder: 'Type here',
				title: 'It can\'t be empty',
				get value() {
					return $.get(v1);
				},

				set value($$value) {
					$.set(v1, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.sibling($.child(div_1), 2);

	Field(node_4, {
		label: 'Details',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			TextArea($$anchor, {
				placeholder: 'Type here',
				get value() {
					return $.get(v2);
				},

				set value($$value) {
					$.set(v2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}