import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';
import Sidebar from '$lib/components/Sidebar.svelte';
import Header from '$lib/components/Header.svelte';

var root = $.from_html(`<!> <div class="shell svelte-12evr8a"><!> <main class="svelte-12evr8a"><!></main></div>`, 1);

export default function _layout($$anchor, $$props) {
	let sidebarOpen = $.state(false);

	function toggleSidebar() {
		$.set(sidebarOpen, !$.get(sidebarOpen));
	}

	var fragment = root();
	var node = $.first_child(fragment);

	Header(node, { onToggleSidebar: toggleSidebar });

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Sidebar(node_1, {
		get open() {
			return $.get(sidebarOpen);
		},

		set open($$value) {
			$.set(sidebarOpen, $$value, true);
		}
	});

	var main = $.sibling(node_1, 2);
	var node_2 = $.child(main);

	$.snippet(node_2, () => $$props.children);
	$.reset(main);
	$.reset(div);
	$.append($$anchor, fragment);
}