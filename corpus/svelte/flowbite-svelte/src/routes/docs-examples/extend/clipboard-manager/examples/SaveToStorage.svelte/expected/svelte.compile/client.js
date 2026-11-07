import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<div class="persist-layout"><div id="persist-ex" class="persist-layout"><h2>JavaScript Variables</h2> <p>Select important concepts to remember:</p> <ul><li>let creates block-scoped variables</li> <li>const creates read-only references</li> <li>var creates function-scoped variables</li></ul></div> <div class="notes-panel"><h3>My Notes</h3> <!></div></div>`);

export default function SaveToStorage($$anchor) {
	var div = root();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.sibling($.child(div_1), 2);

	ClipboardManager(node, {
		enableSelectionMenu: true,
		selectionTarget: '#persist-ex',
		placeholder: 'Add your own notes...',
		saveToStorage: false,
		storageKey: 'persist-ex'
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}