import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Spinner } from "flowbite-svelte";

var root = $.from_html(`<div class="text-left"><!></div> <div class="text-center"><!></div> <div class="text-right"><!></div>`, 1);

export default function Alignment($$anchor) {
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Spinner(node, {});
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	Spinner(node_1, {});
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.child(div_2);

	Spinner(node_2, {});
	$.reset(div_2);
	$.append($$anchor, fragment);
}