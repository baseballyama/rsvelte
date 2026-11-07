import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../app.postcss";
import ModeWatcher from "$lib/components/mode-watcher.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, {
		themeColors: { dark: "black", light: "white" },
		disableTransitions: true
	});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children);
	$.append($$anchor, fragment);
}