import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "$lib/registry/ui/spinner/index.js";

var root = $.from_html(`<div class="flex items-center gap-6"><!> <!> <!> <!></div>`);

export default function Spinner_size_demo($$anchor) {
	var div = root();
	var node = $.child(div);

	Spinner(node, { class: 'size-3' });

	var node_1 = $.sibling(node, 2);

	Spinner(node_1, { class: 'size-4' });

	var node_2 = $.sibling(node_1, 2);

	Spinner(node_2, { class: 'size-6' });

	var node_3 = $.sibling(node_2, 2);

	Spinner(node_3, { class: 'size-8' });
	$.reset(div);
	$.append($$anchor, div);
}