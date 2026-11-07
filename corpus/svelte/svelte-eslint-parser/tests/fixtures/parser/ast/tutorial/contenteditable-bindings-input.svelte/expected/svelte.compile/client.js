import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div contenteditable="true" class="svelte-140lnpe"></div> <pre> </pre>`, 1);

export default function Contenteditable_bindings_input($$anchor) {
	let html = '<p>Write some text!</p>';
	var fragment = root();
	var div = $.first_child(fragment);
	var pre = $.sibling(div, 2);
	var text = $.only_child(pre, true);

	$.template_effect(() => $.set_text(text, html));
	$.bind_content_editable('innerHTML', div, () => html, ($$value) => html = $$value);
	$.append($$anchor, fragment);
}