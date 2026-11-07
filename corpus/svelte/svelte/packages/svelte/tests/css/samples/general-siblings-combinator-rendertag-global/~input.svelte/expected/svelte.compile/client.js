import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p class="before svelte-17pp353">before</p> <!> <p class="foo svelte-17pp353"><span class="svelte-17pp353">foo</span></p> <p class="bar svelte-17pp353">bar</p></div>`);

export default function Input($$anchor) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	$.snippet(node, () => children);
	$.next(4);
	$.reset(div);
	$.append($$anchor, div);
}