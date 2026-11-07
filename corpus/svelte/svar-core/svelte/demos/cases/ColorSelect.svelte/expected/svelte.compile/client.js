import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ColorSelect, Field } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3> </h3> <!></div> <div class="demo-box"><h3>Custom colors</h3> <!> <!> <!></div> <div class="demo-box"><h3>Clear icon</h3> <!></div>`, 1);

export default function ColorSelect_1($$anchor) {
	let color = $.state("");
	var fragment = root();
	var div = $.first_child(fragment);
	var h3 = $.child(div);
	var text = $.only_child(h3);
	var node = $.sibling(h3, 2);

	Field(node, {
		label: 'Select a color',
		children: ($$anchor, $$slotProps) => {
			ColorSelect($$anchor, {
				title: 'Colors can be reconfigured',
				get value() {
					return $.get(color);
				},

				set value($$value) {
					$.set(color, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Field(node_1, {
		label: 'Your color',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			ColorSelect($$anchor, {
				colors: ["#65D3B3", "#FFC975", "#58C3FE"],
				placeholder: 'Select a color...'
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Disabled',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			ColorSelect($$anchor, {
				colors: ["#65D3B3", "#FFC975", "#58C3FE"],
				placeholder: 'Select a color...',
				disabled: true,
				value: '#65D3B3'
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
			ColorSelect($$anchor, {
				colors: ["#65D3B3", "#FFC975", "#58C3FE"],
				placeholder: 'Select a color...',
				error: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.sibling($.child(div_2), 2);

	Field(node_4, {
		label: 'Select a color',
		children: ($$anchor, $$slotProps) => {
			ColorSelect($$anchor, {
				value: '#65D3B3',
				placeholder: 'Select a color...',
				clear: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.template_effect(() => $.set_text(text, `The selected color: ${($.get(color) ? $.get(color) : "") ?? ''}`));
	$.append($$anchor, fragment);
}