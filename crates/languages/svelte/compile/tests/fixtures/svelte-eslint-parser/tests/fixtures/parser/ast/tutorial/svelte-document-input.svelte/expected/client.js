import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>Select this text to fire events</p> <p> </p>`, 1);

export default function Svelte_document_input($$anchor) {
	let selection = '';
	const handleSelectionChange = (e) => selection = document.getSelection();
	var fragment = root();

	$.event('selectionchange', $.document, handleSelectionChange);

	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Selection: ${selection ?? ''}`));
	$.append($$anchor, fragment);
}