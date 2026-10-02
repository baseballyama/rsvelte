import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<div class="editor-layout"><div id="code-editor" class="border p-4"><pre><code contenteditable="">// Editable area</code></pre></div> <div class="snippets-sidebar"><!></div></div>`);

export default function CodeEditor($$anchor) {
	let snippets = [
		{
			id: 1,
			text: "console.log()",
			pinned: true,
			timestamp: Date.now() - 20 * 60 * 1000
		},

		{
			id: 2,
			text: "async function",
			pinned: true,
			timestamp: Date.now() - 30 * 60 * 1000
		}
	];

	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	ClipboardManager(node, {
		get items() {
			return snippets;
		},
		enableSelectionMenu: true,
		selectionTarget: '#code-editor',
		placeholder: 'Save code snippet...',
		maxLength: 5000,
		filterSensitive: false,
		storageKey: 'code-editor'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}