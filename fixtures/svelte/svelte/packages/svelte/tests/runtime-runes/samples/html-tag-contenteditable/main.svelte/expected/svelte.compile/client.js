import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div id="editable" contenteditable="true"></div> <p id="output"> </p>`, 1);

export default function Main($$anchor) {
	let content = $.state("");
	var fragment = root();
	var div = $.first_child(fragment);

	$.html(div, () => $.get(content), true);
	$.reset(div);

	var p = $.sibling(div, 2);
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(content)));

	$.event('blur', div, (e) => {
		$.set(content, e.currentTarget.textContent, true);
	});

	$.append($$anchor, fragment);
}