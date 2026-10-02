import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="myClass svelte-ryq88m">Hello!</span> <b class="svelte-ryq88m"></b>`, 1);

export default function Simple_css_input($$anchor) {
	let a = 10;
	var fragment = root();
	var b = $.sibling($.first_child(fragment), 2);

	b.textContent = '10';
	$.append($$anchor, fragment);
}