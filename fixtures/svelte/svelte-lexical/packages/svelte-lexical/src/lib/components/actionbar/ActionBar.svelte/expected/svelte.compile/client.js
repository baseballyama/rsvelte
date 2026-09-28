import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ImportButton from './ImportButton.svelte';
import ExportButton from './ExportButton.svelte';
import ReadonlyButton from './ReadonlyButton.svelte';

var root = $.from_html(`<div class="actions"><!> <!> <!></div>`);

export default function ActionBar($$anchor) {
	var div = root();
	var node = $.child(div);

	ImportButton(node, {});

	var node_1 = $.sibling(node, 2);

	ExportButton(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	ReadonlyButton(node_2, {});
	$.reset(div);
	$.append($$anchor, div);
}