import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="blog-post"><h1></h1> <!></div>`);

export default function _2_input($$anchor) {
	var div = root();
	var h1 = $.child(div);

	h1.textContent = post.title;

	var node = $.sibling(h1, 2);

	$.html(node, () => post.content);
	$.reset(div);
	$.append($$anchor, div);
}