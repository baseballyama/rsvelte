import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container svelte-6dwu3h"><span>^this is not the top of the screen</span> <div class="spacer svelte-6dwu3h"></div></div>`);

export default function _page($$anchor) {
	var div = root();

	$.append($$anchor, div);
}