import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select, Field } from "../../src/index";
import { users } from "../data/userlist";

var root = $.from_html(`<div class="demo-box"><h3>Select with a top label</h3> <!></div> <div class="demo-box"><h3>Select with a side label</h3> <!> <!> <!></div>`, 1);

export default function Select_1($$anchor) {
	let v1 = $.state("");
	let v2 = $.state("");
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Details',
		children: ($$anchor, $$slotProps) => {
			Select($$anchor, {
				get options() {
					return users;
				},

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
	var node_1 = $.sibling($.child(div_1), 2);

	Field(node_1, {
		label: 'Details',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Select($$anchor, {
				get options() {
					return users;
				},

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

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Disabled',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Select($$anchor, {
				disabled: true,
				get options() {
					return users;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Error',
		position: 'left',
		error: true,
		children: ($$anchor, $$slotProps) => {
			Select($$anchor, {
				error: true,
				get options() {
					return users;
				},
				title: 'Invalid option'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}