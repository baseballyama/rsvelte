import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="box svelte-ff8cx1"><!></div>`);

export default function Slots02_input($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(div);
	$.append($$anchor, div);
}