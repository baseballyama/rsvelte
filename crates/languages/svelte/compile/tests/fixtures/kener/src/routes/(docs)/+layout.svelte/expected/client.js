import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../layout.css";
import "../kener.css";
import "../docs.css";
import "../prose.css";
import "highlight.js/styles/github-dark.css";
import { ModeWatcher } from "mode-watcher";
import { resolve } from "$app/paths";
import { Toaster } from "$lib/components/ui/sonner/index.js";

var root = $.from_html(`<!> <!> <main><!></main>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let base = resolve("/");
	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, {});

	var node_1 = $.sibling(node, 2);

	Toaster(node_1, {});

	var main = $.sibling(node_1, 2);
	var node_2 = $.child(main);

	$.snippet(node_2, () => $$props.children);
	$.reset(main);
	$.append($$anchor, fragment);
	$.pop();
}