import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text, Field } from "../../src/index";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><h3>Top Fields</h3> <!> <!> <!></div> <div class="demo-box"><h3>Left Field</h3> <!> <!> <!></div> <div class="demo-box"><h3>Nested Field controls</h3> <!></div>`, 1);

export default function Field_1($$anchor) {
	let v1 = $.state("");
	let v2 = $.state("");
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'Text',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
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
		label: 'Error',
		error: true,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				error: true,
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
		label: 'Required',
		required: true,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
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
	var node_3 = $.sibling($.child(div_1), 2);

	Field(node_3, {
		label: 'Text',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
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

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Error',
		position: 'left',
		error: true,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				error: true,
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

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Required',
		position: 'left',
		required: true,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
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

	var div_2 = $.sibling(div_1, 2);
	var node_6 = $.sibling($.child(div_2), 2);

	Field(node_6, {
		label: 'Each control is associated with its closest Field label',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_7 = $.first_child(fragment_7);

			Field(node_7, {
				label: 'First Name',
				position: 'left',
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Field(node_8, {
				label: 'Last Name',
				position: 'left',
				children: ($$anchor, $$slotProps) => {
					Text($$anchor, {});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.append($$anchor, fragment);
}