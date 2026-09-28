import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<!> <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>`, 1);

export default function EnableSelectionMenu($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ClipboardManager(node, { enableSelectionMenu: true });
	$.next(2);
	$.append($$anchor, fragment);
}