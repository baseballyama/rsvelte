import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from 'foo.svelte';

var root = $.from_html(`<button></button> <!>`, 1);

export default function Ts_event02_type_output($$anchor) {
	var fragment = root();

	var // Component: LegacyComponentType
	button = $.first_child(fragment);

	var node = $.sibling(button, 2);

	Component(node, { onclick: (e) => {} });
	$.delegated('click', button, (e) => {});
	$.append($$anchor, fragment);
}

$.delegate(['click']);