import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<div id="state-data"> </div> <div id="state-error"> </div> <div id="url-hash"> </div> <nav><a href="/state/data/xxx">xxx</a> <a href="/state/data/yyy">yyy</a> <a href="/state/data/zzz">zzz</a> <a href="/state/data/foo">foo</a></nav> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var div = $.first_child(fragment);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_1 = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var text_2 = $.only_child(div_2, true);
	var node = $.sibling(div_2, 4);

	$.slot(node, $$props, 'default', {}, null);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, page.error?.message);
			$.set_text(text_2, page.url.hash);
		},
		[() => JSON.stringify(page.data)]
	);

	$.append($$anchor, fragment);
	$.pop();
}