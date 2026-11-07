import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ColorBoard, ColorPicker, Field } from "../../src/index";

var root = $.from_html(`<div class="demo-box"><h3> </h3> <div style="width:300px; height: auto;"><!></div> <h3> </h3> <div style="width:300px; height: auto;"><!></div></div> <div class="demo-box"><h3>Custom color select forms:</h3> <!> <!> <!> <!></div>`, 1);

export default function ColorPicker_1($$anchor) {
	let value = $.state("#48C8E2");
	let selectedColor = $.state("");
	var fragment = root();
	var div = $.first_child(fragment);
	var h3 = $.child(div);
	var text = $.only_child(h3);
	var div_1 = $.sibling(h3, 2);
	var node = $.child(div_1);

	ColorBoard(node, {
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	$.reset(div_1);

	var h3_1 = $.sibling(div_1, 2);
	var text_1 = $.only_child(h3_1);
	var div_2 = $.sibling(h3_1, 2);
	var node_1 = $.child(div_2);

	ColorBoard(node_1, {
		get value() {
			return $.get(selectedColor);
		},

		set value($$value) {
			$.set(selectedColor, $$value, true);
		}
	});

	$.reset(div_2);
	$.reset(div);

	var div_3 = $.sibling(div, 2);
	var node_2 = $.sibling($.child(div_3), 2);

	Field(node_2, {
		label: 'Your color',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			ColorPicker($$anchor, { value: '#5D59BA', placeholder: 'Select a color...' });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Disabled',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			ColorPicker($$anchor, {
				placeholder: 'Select a color...',
				disabled: true,
				value: '#65D3B3'
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
			ColorPicker($$anchor, { placeholder: 'Select a color...', error: true });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Field(node_5, {
		label: 'Clear button',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			ColorPicker($$anchor, {
				value: '#65D3B3',
				placeholder: 'Select a color...',
				clear: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	$.template_effect(() => {
		$.set_text(text, `The current color: ${($.get(value) || "") ?? ''}`);
		$.set_text(text_1, `The selected form color: ${($.get(selectedColor) || "") ?? ''}`);
	});

	$.append($$anchor, fragment);
}