import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Text, Field } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3>Text with a top label</h3> <!> <!> <!> <!></div> <div class="demo-box"><h3>Text with a side label</h3> <!> <!></div> <div class="demo-box"><h3>Number input with a side label</h3> <!></div> <div class="demo-box"><h3>Password input with a side label</h3> <!></div> <div class="demo-box"><h3>Icon inside of the text control</h3> <!> <!></div> <div class="demo-box"><h3>Text control with clear button</h3> <!> <!> <!> <!> <!> <!></div>`, 1);

export default function Text_1($$anchor) {
	let text2 = $.state("");
	let password2 = $.state("");
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		label: 'First name',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				placeholder: 'Type here',
				get value() {
					return $.get(text2);
				},

				set value($$value) {
					$.set(text2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Last name',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				placeholder: 'Type here',
				get value() {
					return $.get(text2);
				},

				set value($$value) {
					$.set(text2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Last name',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				disabled: true,
				placeholder: 'Type here',
				get value() {
					return $.get(text2);
				},

				set value($$value) {
					$.set(text2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Last name',
		error: true,
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				error: true,
				placeholder: 'Type here',
				title: 'Invalid value',
				get value() {
					return $.get(text2);
				},

				set value($$value) {
					$.set(text2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.sibling($.child(div_1), 2);

	Field(node_4, {
		label: 'First name',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				get value() {
					return $.get(text2);
				},

				set value($$value) {
					$.set(text2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Last name',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				get value() {
					return $.get(text2);
				},

				set value($$value) {
					$.set(text2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_6 = $.sibling($.child(div_2), 2);

	Field(node_6, {
		label: 'Number',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { type: 'number' });
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_7 = $.sibling($.child(div_3), 2);

	Field(node_7, {
		label: 'Password',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				type: 'password',
				get value() {
					return $.get(password2);
				},

				set value($$value) {
					$.set(password2, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_8 = $.sibling($.child(div_4), 2);

	Field(node_8, {
		label: 'Start Date',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { icon: 'wxi-calendar', css: 'wx-icon-left' });
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	Field(node_9, {
		label: 'End Date',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { icon: 'wxi-calendar' });
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_10 = $.sibling($.child(div_5), 2);

	Field(node_10, {
		label: 'First name',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { placeholder: 'Type here', clear: true });
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Field(node_11, {
		label: 'Number',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { type: 'number', clear: true });
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	Field(node_12, {
		label: 'Number and icon',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { type: 'number', clear: true, icon: 'wxi-calendar' });
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Field(node_13, {
		label: 'Number and icon left',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, {
				type: 'number',
				clear: true,
				icon: 'wxi-calendar',
				css: 'wx-icon-left'
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Field(node_14, {
		label: 'End Date',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { icon: 'wxi-calendar', clear: true });
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	Field(node_15, {
		label: 'Start Date',
		position: 'top',
		children: ($$anchor, $$slotProps) => {
			Text($$anchor, { icon: 'wxi-calendar', css: 'wx-icon-left', clear: true });
		},
		$$slots: { default: true }
	});

	$.reset(div_5);
	$.append($$anchor, fragment);
}