import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="one" href="/data-sveltekit/reload/target" data-sveltekit-reload="">one</a> <div data-sveltekit-reload=""><a id="two" href="/data-sveltekit/reload/target">two</a> <a id="three" href="/data-sveltekit/reload/target">three</a></div>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var a = $.sibling($.child(div), 2);

	$.set_attribute(a, 'data-sveltekit-reload', false);
	$.reset(div);
	$.append($$anchor, fragment);
}