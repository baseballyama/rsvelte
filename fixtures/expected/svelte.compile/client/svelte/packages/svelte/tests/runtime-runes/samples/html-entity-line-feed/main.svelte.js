import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(
	`<span id="attr" title="A
B"></span> <span id="attr-decimal" title="A
B"></span> <span id="attr-other-entity" title="©"></span> <!>`,
	1
);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 6);

	Component(node, { text: 'A\nB' });
	$.append($$anchor, fragment);
}