import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<div id="article-content"><p>Your article content here...</p> <p>Users can select any text to save it.</p></div> <!>`, 1);

export default function TargetSpecific($$anchor) {
	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ClipboardManager(node, {
		enableSelectionMenu: true,
		selectionTarget: '#article-content',
		storageKey: 'specific-target'
	});

	$.append($$anchor, fragment);
}