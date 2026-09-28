import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Autocomplete from '@smui-extra/autocomplete';

var root = $.from_html(`<div><!> <pre class="status"> </pre></div>`);

export default function _FullWidth($$anchor) {
	let fruits = ['Apple', 'Orange', 'Banana', 'Mango'];
	let value = $.state(void 0);
	var div = root();
	var node = $.child(div);

	Autocomplete(node, {
		get options() {
			return fruits;
		},
		label: 'Fruit',
		style: 'width: 100%;',
		textfield$style: 'width: 100%;',
		get value() {
			return $.get(value);
		},

		set value($$value) {
			$.set(value, $$value, true);
		}
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Selected: ${($.get(value) || '') ?? ''}`));
	$.append($$anchor, div);
}