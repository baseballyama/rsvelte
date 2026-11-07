import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="modal"><!></div>`);

export default function Input($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}