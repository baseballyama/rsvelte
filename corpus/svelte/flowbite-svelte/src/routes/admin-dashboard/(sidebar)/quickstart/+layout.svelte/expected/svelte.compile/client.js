import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="mx-auto max-w-7xl"><!></div>`);

export default function _layout($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
}