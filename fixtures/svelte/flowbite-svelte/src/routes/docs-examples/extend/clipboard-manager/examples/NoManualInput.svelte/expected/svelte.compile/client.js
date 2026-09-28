import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<div id="no-manual-input" class="lesson-content"><h2>JavaScript Variables</h2> <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p></div> <!>`, 1);

export default function NoManualInput($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ClipboardManager(node, {
		enableSelectionMenu: true,
		selectionTarget: '#no-manual-input',
		showInput: false,
		storageKey: 'no-manual-input'
	});

	$.append($$anchor, fragment);
}