import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Widget from './Widget.svelte';

var root = $.from_html(`<p>control</p> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Widget(node, {});
	$.append($$anchor, fragment);
}