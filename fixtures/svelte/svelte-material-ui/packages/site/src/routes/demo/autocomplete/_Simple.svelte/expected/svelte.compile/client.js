import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';

var root = $.from_html(`<div class="columns margins"><div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div> <div><!> <pre class="status"> </pre></div></div> <div>Disabled: <div class="columns margins"><div><!></div> <div><!></div> <div><!></div></div></div>`, 1);

export default function _Simple($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let valueStandard = $.state(void 0);
	let valueFilled = $.state(void 0);
	let valueOutlined = $.state(void 0);
	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Autocomplete(node, {
		get options() {
			return fruits;
		},
		label: 'Standard',
		get value() {
			return $.get(valueStandard);
		},

		set value($$value) {
			$.set(valueStandard, $$value, true);
		}
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
		textfield$variant: 'filled',
		label: 'Filled',
		get value() {
			return $.get(valueFilled);
		},

		set value($$value) {
			$.set(valueFilled, $$value, true);
		}
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
		textfield$variant: 'outlined',
		label: 'Outlined',
		get value() {
			return $.get(valueOutlined);
		},

		set value($$value) {
			$.set(valueOutlined, $$value, true);
		}
	});

	var pre_2 = $.sibling(node_2, 2);
	var text_2 = $.only_child(pre_2);

	$.reset(div_3);
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var div_5 = $.sibling($.child(div_4));
	var div_6 = $.child(div_5);
	var node_3 = $.child(div_6);

	Autocomplete(node_3, {
		get options() {
			return fruits;
		},
		disabled: true,
		label: 'Standard'
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_4 = $.child(div_7);

	Autocomplete(node_4, {
		get options() {
			return fruits;
		},
		textfield$variant: 'filled',
		disabled: true,
		label: 'Filled'
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_5 = $.child(div_8);

	Autocomplete(node_5, {
		get options() {
			return fruits;
		},
		textfield$variant: 'outlined',
		disabled: true,
		label: 'Outlined'
	});

	$.reset(div_8);
	$.reset(div_5);
	$.reset(div_4);

	$.template_effect(() => {
		$.set_text(text, `Selected: ${($.get(valueStandard) || '') ?? ''}`);
		$.set_text(text_1, `Selected: ${($.get(valueFilled) || '') ?? ''}`);
		$.set_text(text_2, `Selected: ${($.get(valueOutlined) || '') ?? ''}`);
	});

	$.append($$anchor, fragment);
}