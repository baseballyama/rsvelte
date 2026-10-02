import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Sidebar from "$lib/web/docs/Sidebar.svelte";

var root = $.from_html(`<div class="mx-auto mt-10 flex min-h-[52vh] max-w-6xl lg:gap-12"><div><!></div> <div class="h-fit w-full px-6"><!></div></div>`);

export default function _layout($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Sidebar(node, {});
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.children);
	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
}