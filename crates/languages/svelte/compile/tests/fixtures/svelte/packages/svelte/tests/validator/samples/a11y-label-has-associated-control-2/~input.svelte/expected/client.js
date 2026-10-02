import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './component.svelte';

var root = $.from_html(`<label><!></label> <label><!></label>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var label = $.first_child(fragment);
	var node = $.child(label);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var node_1 = $.child(label_1);

	Component(node_1, {});
	$.reset(label_1);
	$.append($$anchor, fragment);
}