import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ModeWatcher, toggleMode } from "mode-watcher";
import "../app.css";
import { activeElement, PressedKeys } from "runed";

var root = $.from_html(`<!> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	let keys = new PressedKeys();

	keys.onKeys(["d"], () => {
		if (activeElement.current?.localName === "input" || activeElement.current?.localName === "textarea") return;

		toggleMode();
	});

	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, {});

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.children);
	$.append($$anchor, fragment);
	$.pop();
}