import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<article class="mx-auto max-w-4xl"><div id="article-body" class="prose"><h1>How to Build Better UIs</h1> <p>Select any quote or insight to save for later...</p></div></article> <div class="mx-auto w-80"><!></div>`, 1);

export default function BlogReader($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var node = $.child(div);

	ClipboardManager(node, {
		enableSelectionMenu: true,
		selectionTarget: '#article-body',
		saveLabel: 'Add',
		clearLabel: 'Clear All!',
		storageKey: 'blog-reader'
	});

	$.reset(div);
	$.append($$anchor, fragment);
}