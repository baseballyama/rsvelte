import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';
import Textfield from '@smui/textfield';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div>`);

export default function _Manual($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueStandard = $.state(void 0);
	let textStandard = $.state('');
	let valueFilled = $.state(void 0);
	let textFilled = $.state('');
	let valueOutlined = $.state(void 0);
	let textOutlined = $.state('');
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Autocomplete(node, {
		get options() {
			return fruits;
		},

		get value() {
			return $.get(valueStandard);
		},

		set value($$value) {
			$.set(valueStandard, $$value, true);
		},

		get text() {
			return $.get(textStandard);
		},

		set text($$value) {
			$.set(textStandard, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Textfield($$anchor, {
				label: 'Fruit',
				get value() {
					return $.get(textStandard);
				},

				set value($$value) {
					$.set(textStandard, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	Autocomplete(node_1, {
		get options() {
			return fruits;
		},

		get value() {
			return $.get(valueFilled);
		},

		set value($$value) {
			$.set(valueFilled, $$value, true);
		},

		get text() {
			return $.get(textFilled);
		},

		set text($$value) {
			$.set(textFilled, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Textfield($$anchor, {
				label: 'Fruit',
				variant: 'filled',
				get value() {
					return $.get(textFilled);
				},

				set value($$value) {
					$.set(textFilled, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var pre_1 = $.sibling(node_1, 2);
	var text_1 = $.only_child(pre_1);

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_2 = $.child(div_3);

	Autocomplete(node_2, {
		get options() {
			return fruits;
		},

		get value() {
			return $.get(valueOutlined);
		},

		set value($$value) {
			$.set(valueOutlined, $$value, true);
		},

		get text() {
			return $.get(textOutlined);
		},

		set text($$value) {
			$.set(textOutlined, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Textfield($$anchor, {
				label: 'Fruit',
				variant: 'outlined',
				get value() {
					return $.get(textOutlined);
				},

				set value($$value) {
					$.set(textOutlined, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var pre_2 = $.sibling(node_2, 2);
	var text_2 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `Selected: ${($.get(valueStandard) || '') ?? ''}`);
		$.set_text(text_1, `Selected: ${($.get(valueFilled) || '') ?? ''}`);
		$.set_text(text_2, `Selected: ${($.get(valueOutlined) || '') ?? ''}`);
	});

	$.append($$anchor, div);
}