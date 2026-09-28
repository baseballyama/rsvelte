import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Counter, Field } from "../../src/index";

var root = $.from_html(`<!> <div> </div>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function Counter_1($$anchor) {
	let v1 = $.state(5);
	let v2 = $.state(3);
	let v3 = $.state(29);
	let v4 = $.state(0);

	function handleChange({ input, value }) {
		if (!input) $.set(v4, value, true);
	}

	var div = root_1();
	var node = $.child(div);

	Field(node, {
		label: 'No initial value',
		children: ($$anchor, $$slotProps) => {
			Counter($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Initial value',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			Counter(node_2, {
				get value() {
					return $.get(v1);
				},

				set value($$value) {
					$.set(v1, $$value, true);
				}
			});

			var div_1 = $.sibling(node_2, 2);
			var text = $.only_child(div_1);

			$.template_effect(() => $.set_text(text, `The value is: ${$.get(v1) ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 2);

	Field(node_3, {
		label: 'Custom step',
		children: ($$anchor, $$slotProps) => {
			Counter($$anchor, {
				step: 3,
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
		label: 'With negative numbers',
		children: ($$anchor, $$slotProps) => {
			Counter($$anchor, { min: -Infinity });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'With custom min and max values (-30, 30)',
		children: ($$anchor, $$slotProps) => {
			Counter($$anchor, {
				min: -30,
				max: 30,
				get value() {
					return $.get(v3);
				},

				set value($$value) {
					$.set(v3, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Field(node_6, {
		label: 'Handling change event',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_7 = $.first_child(fragment_5);

			Counter(node_7, { onchange: handleChange });

			var div_2 = $.sibling(node_7, 2);
			var text_1 = $.only_child(div_2);

			$.template_effect(() => $.set_text(text_1, `The value is: ${$.get(v4) ?? ''}`));
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 2);

	Field(node_8, {
		label: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			Counter($$anchor, { disabled: true });
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Field(node_9, {
		label: 'Readonly',
		children: ($$anchor, $$slotProps) => {
			Counter($$anchor, { readonly: true });
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	Field(node_10, {
		label: 'Error',
		children: ($$anchor, $$slotProps) => {
			Counter($$anchor, { error: true });
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}