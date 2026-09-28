import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><p class="before svelte-1wmc2u9">before</p> <!> <p class="foo svelte-1wmc2u9"><span class="svelte-1wmc2u9">foo</span></p> <p class="bar svelte-1wmc2u9">bar</p></div>`);

export default function Input($$anchor, $$props) {
	var div = root();
	var node = $.sibling($.child(div), 2);

	$.slot(node, $$props, 'default', {}, null);
	$.next(4);
	$.reset(div);
	$.append($$anchor, div);
}