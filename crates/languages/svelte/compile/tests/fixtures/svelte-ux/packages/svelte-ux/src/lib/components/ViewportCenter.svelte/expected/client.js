import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="ViewportCenter fixed top-0 left-0 h-screen w-screen flex flex-col items-center justify-center"><!></div>`);

export default function ViewportCenter($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}