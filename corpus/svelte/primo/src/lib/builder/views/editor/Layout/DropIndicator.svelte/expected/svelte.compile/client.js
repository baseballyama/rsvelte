import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="DropIndicator svelte-197decz"></div>`);

export default function DropIndicator($$anchor, $$props) {
	$.push($$props, true);

	let node = $.prop($$props, 'node', 15);
	var div = root();

	$.bind_this(div, ($$value) => node($$value), () => node());
	$.append($$anchor, div);
	$.pop();
}