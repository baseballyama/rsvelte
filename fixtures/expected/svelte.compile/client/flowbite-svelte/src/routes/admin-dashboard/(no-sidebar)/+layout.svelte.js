import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Footer from "../(no-sidebar)/Footer.svelte";
import Navbar from "../(sidebar)/Navbar.svelte";

var root = $.from_html(`<header class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"><!></header> <div class="mx-auto max-w-screen-2xl pt-[70px]"><!> <!></div>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();

	var // import '../../app.css';
	header = $.first_child(fragment);

	var node = $.child(header);

	Navbar(node, {});
	$.reset(header);

	var div = $.sibling(header, 2);
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children);

	var node_2 = $.sibling(node_1, 2);

	Footer(node_2, {});
	$.reset(div);
	$.append($$anchor, fragment);
}