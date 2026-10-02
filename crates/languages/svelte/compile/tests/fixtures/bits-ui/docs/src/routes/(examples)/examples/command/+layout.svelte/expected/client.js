import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "$lib/styles/command/globals.css";
import "$lib/styles/command/icons.css";
import "$lib/styles/command/command.css";

export default function _layout($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
}