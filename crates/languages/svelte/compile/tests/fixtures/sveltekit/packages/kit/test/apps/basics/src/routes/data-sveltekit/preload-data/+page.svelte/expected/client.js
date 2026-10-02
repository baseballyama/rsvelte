import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a id="one" href="/data-sveltekit/preload-data/target" data-sveltekit-preload-data="">one</a> <div data-sveltekit-preload-data=""><a id="two" href="/data-sveltekit/preload-data/target">two</a> <a id="three" href="/data-sveltekit/preload-data/target">three</a></div> <a id="tap" href="/data-sveltekit/preload-data/target" data-sveltekit-preload-data="tap">tap</a> <a id="hover-then-tap" href="/data-sveltekit/preload-data/target" data-sveltekit-preload-code="hover" data-sveltekit-preload-data="tap">hover for code then tap for data</a> <a id="dynamic" data-sveltekit-preload-data="hover">dynamic</a> <button id="change_dynamic" type="button">change dynamic</button>`, 1);

export default function _page($$anchor) {
	let x = 0;
	var fragment = root();
	var div = $.sibling($.first_child(fragment), 2);
	var a = $.sibling($.child(div), 2);

	$.set_attribute(a, 'data-sveltekit-preload-data', false);
	$.reset(div);

	var a_1 = $.sibling(div, 6);
	var button = $.sibling(a_1, 2);

	$.template_effect(() => $.set_attribute(a_1, 'href', `/data-sveltekit/preload-data/target?x=${x ?? ''}`));
	$.delegated('click', button, () => x++);
	$.append($$anchor, fragment);
}

$.delegate(['click']);