import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Switch, Field } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3>Switch Button</h3> <!></div> <div class="demo-box"><h3>Switch Button with a side label</h3> <!> <!></div>`, 1);

export default function Switch_1($$anchor) {
	let v1 = $.state(true);
	let v2 = $.state(false);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
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
		get label() {
			return `Switch: ${$.get(v2) ?? ''}`;
		},
		position: 'left',
		type: 'switch',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
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
		type: 'switch',
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, { disabled: true });
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}