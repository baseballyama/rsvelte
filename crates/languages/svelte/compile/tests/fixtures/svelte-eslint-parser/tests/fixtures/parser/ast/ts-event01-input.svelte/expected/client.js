import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from 'foo.svelte';

var root = $.from_html(`<button></button> <!>`, 1);

export default function Ts_event01_input($$anchor) {
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Component(node, { $$events: { click: (e) => {} } });
	$.event('click', button, (e) => {});
	$.append($$anchor, fragment);
}