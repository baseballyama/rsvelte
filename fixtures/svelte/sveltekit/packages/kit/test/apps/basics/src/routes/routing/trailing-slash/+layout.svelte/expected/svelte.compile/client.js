import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<ul data-sveltekit-preload-data="hover"><li><a href="/routing/trailing-slash/always">/always</a></li> <li><a href="/routing/trailing-slash/ignore/">/ignore/</a></li> <li><a href="/routing/trailing-slash/never/">/never/</a></li></ul> <p> </p> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	$.slot(node, $$props, 'default', {}, null);
	$.template_effect(() => $.set_text(text, page.url.pathname));
	$.append($$anchor, fragment);
	$.pop();
}