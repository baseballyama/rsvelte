import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Message from '#lib/Message.svelte';

var root = $.from_html(`<h2>We're on index.svelte</h2> <!>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	Message(node, {});
	$.append($$anchor, fragment);
}