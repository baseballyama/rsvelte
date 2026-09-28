import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RadioButton, RadioButtonGroup, Field } from "../../src/index";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><h3>RadioButton</h3> <!></div> <div class="demo-box"><h3>RadioButton with side label</h3> <!> <!> <!> <!></div> <div class="demo-box"><h3> </h3> <!></div> <div class="demo-box"><h3>RadioButton group: inline</h3> <!></div> <div class="demo-box"><h3>RadioButton group: grid</h3> <!></div>`, 1);

export default function Radio($$anchor) {
	let value = $.state(1);

	let options = [
		{ id: 1, label: "Option 1" },
		{ id: 2, label: "Option 2" },
		{ id: 3, label: "Option 3" },
		{ id: 4, label: "Option 4" },
		{ id: 5, label: "Option 5" }
	];

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			RadioButton(node_1, { label: 'Option 1', value: true, name: 'a1' });

			var node_2 = $.sibling(node_1, 2);

			RadioButton(node_2, { label: 'Option 2', name: 'a1' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.sibling($.child(div_1), 2);

	Field(node_3, {
		label: 'Radio 1',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButton($$anchor, { name: 'a2' });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Radio 2',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButton($$anchor, { name: 'a2' });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Disabled',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButton($$anchor, { label: 'Default', disabled: true, name: 'a2' });
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Field(node_6, {
		label: 'Checked',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButton($$anchor, { label: 'Checked', value: true, name: 'a2' });
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var h3 = $.child(div_2);
	var text = $.only_child(h3);
	var node_7 = $.sibling(h3, 2);

	Field(node_7, {
		label: 'Radio group',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButtonGroup($$anchor, {
				get options() {
					return options;
				},

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

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_8 = $.sibling($.child(div_3), 2);

	Field(node_8, {
		label: 'Radio group',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButtonGroup($$anchor, {
				get options() {
					return options;
				},
				type: 'inline',
				value: 3
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_9 = $.sibling($.child(div_4), 2);

	Field(node_9, {
		label: 'Radio group',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			RadioButtonGroup($$anchor, {
				get options() {
					return options;
				},
				type: 'grid',
				value: 4
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.template_effect(() => $.set_text(text, `RadioButton group ( ${$.get(value) ?? ''} )`));
	$.append($$anchor, fragment);
}