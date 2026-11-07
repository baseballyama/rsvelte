import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span></span> <span></span>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var span = $.first_child(fragment);

	span.textContent = name;

	var span_1 = $.sibling(span, 2);

	span_1.textContent = count + 1;
	$.append($$anchor, fragment);
}