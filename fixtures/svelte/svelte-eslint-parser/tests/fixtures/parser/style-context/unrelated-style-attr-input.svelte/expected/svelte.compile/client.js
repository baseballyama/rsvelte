import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="myClass svelte-q2zymc">Hello!</span> <b class="svelte-q2zymc"></b>`, 1);

export default function Unrelated_style_attr_input($$anchor) {
	let a = 10;
	var fragment = root();
	var b = $.sibling($.first_child(fragment), 2);

	b.textContent = '10';
	$.append($$anchor, fragment);
}