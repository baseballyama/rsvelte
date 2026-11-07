import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Navbar from "./Navbar.svelte";
import Sidebar from "./Sidebar.svelte";

var root = $.from_html(`<header class="fixed top-0 z-40 mx-auto w-full flex-none border-b border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"><!></header> <div class="overflow-hidden lg:flex"><!> <div class="relative h-full w-full overflow-y-auto pt-[70px] lg:ml-64"><!></div></div>`, 1);

export default function _layout($$anchor, $$props) {
	let drawerHidden = $.state(false);
	var fragment = root();
	var header = $.first_child(fragment);
	var node = $.child(header);

	Navbar(node, {
		get drawerHidden() {
			return $.get(drawerHidden);
		},

		set drawerHidden($$value) {
			$.set(drawerHidden, $$value, true);
		}
	});

	$.reset(header);

	var div = $.sibling(header, 2);
	var node_1 = $.child(div);

	Sidebar(node_1, {
		get drawerHidden() {
			return $.get(drawerHidden);
		},

		set drawerHidden($$value) {
			$.set(drawerHidden, $$value, true);
		}
	});

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	$.snippet(node_2, () => $$props.children);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, fragment);
}