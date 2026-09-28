import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Field, CheckboxGroup } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3>Checkbox</h3> <p><!></p> <p><!></p></div> <div class="demo-box"><h3>Checkbox with a side label</h3> <!> <!> <!></div> <div class="demo-box"><h3> </h3> <!></div> <div class="demo-box"><h3> </h3> <!></div> <div class="demo-box"><h3> </h3> <!></div>`, 1);

export default function Checkbox_1($$anchor) {
	let options = [
		{ id: 1, label: "Option 1" },
		{ id: 2, label: "Option 2" },
		{ id: 3, label: "Option 3" },
		{ id: 4, label: "Option 4" },
		{ id: 5, label: "Option 5" }
	];

	let v1 = $.state(true);
	let v2 = $.state(false);
	let v3 = $.state(true);
	let valueGroup1 = $.state($.proxy([1, 2]));
	let valueGroup2 = $.state($.proxy([2, 3]));
	let valueGroup3 = $.state($.proxy([3, 4]));

	function print(v) {
		return v.join(", ");
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.sibling($.child(div));
	var p = $.sibling(text);
	var node = $.child(p);

	Checkbox(node, {
		label: 'Check',
		get value() {
			return $.get(v1);
		},

		set value($$value) {
			$.set(v1, $$value, true);
		}
	});

	$.reset(p);

	var text_1 = $.sibling(p);
	var p_1 = $.sibling(text_1);
	var node_1 = $.child(p_1);

	Checkbox(node_1, {
		label: 'Uncheck',
		get value() {
			return $.get(v2);
		},

		set value($$value) {
			$.set(v2, $$value, true);
		}
	});

	$.reset(p_1);
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.sibling($.child(div_1), 2);

	Field(node_2, {
		label: 'Checkbox',
		type: 'checkbox',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Disabled',
		type: 'checkbox',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, { label: 'Default', disabled: true });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Disabled',
		type: 'checkbox',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				label: 'Checked',
				disabled: true,
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

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var h3 = $.child(div_2);
	var text_2 = $.only_child(h3);
	var node_5 = $.sibling(h3, 2);

	Field(node_5, {
		label: 'Check group',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			CheckboxGroup($$anchor, {
				get options() {
					return options;
				},

				get value() {
					return $.get(valueGroup1);
				},

				set value($$value) {
					$.set(valueGroup1, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var h3_1 = $.child(div_3);
	var text_3 = $.only_child(h3_1);
	var node_6 = $.sibling(h3_1, 2);

	Field(node_6, {
		label: 'Check group',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			CheckboxGroup($$anchor, {
				get options() {
					return options;
				},
				type: 'inline',
				get value() {
					return $.get(valueGroup2);
				},

				set value($$value) {
					$.set(valueGroup2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var h3_2 = $.child(div_4);
	var text_4 = $.only_child(h3_2);
	var node_7 = $.sibling(h3_2, 2);

	Field(node_7, {
		label: 'Check group',
		position: 'left',
		type: 'checkbox',
		children: ($$anchor, $$slotProps) => {
			CheckboxGroup($$anchor, {
				get options() {
					return options;
				},
				type: 'grid',
				get value() {
					return $.get(valueGroup3);
				},

				set value($$value) {
					$.set(valueGroup3, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	$.template_effect(
		($0, $1, $2) => {
			$.set_text(text, ` Value:
	${$.get(v1) ?? ''} `);

			$.set_text(text_1, ` Value:
	${$.get(v2) ?? ''} `);

			$.set_text(text_2, `Checkbox group: ${$0 ?? ''}`);
			$.set_text(text_3, `Checkbox group inline: ${$1 ?? ''}`);
			$.set_text(text_4, `Checkbox group grid: ${$2 ?? ''}`);
		},
		[
			() => print($.get(valueGroup1)),
			() => print($.get(valueGroup2)),
			() => print($.get(valueGroup3))
		]
	);

	$.append($$anchor, fragment);
}