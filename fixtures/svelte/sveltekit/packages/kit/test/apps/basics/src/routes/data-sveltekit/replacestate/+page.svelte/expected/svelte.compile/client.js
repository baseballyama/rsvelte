import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="one" href="/data-sveltekit/replacestate/target" data-sveltekit-replacestate="">one</a> <div data-sveltekit-replacestate=""><a id="two" href="/data-sveltekit/replacestate/target">two</a> <a id="three" href="/data-sveltekit/replacestate/target">three</a></div>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var a = $.sibling($.child(div), 2);

	$.set_attribute(a, 'data-sveltekit-replacestate', false);
	$.reset(div);
	$.append($$anchor, fragment);
}