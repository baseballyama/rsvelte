import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import SvelteLogo from '#lib/SvelteLogo.svelte';

var root = $.from_html(`<!> <h2> </h2> <a href="/path-base/base/two">/path-base/base/two</a>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	SvelteLogo(node, {});

	var h2 = $.sibling(node, 2);
	var text = $.only_child(h2, true);

	$.next(2);
	$.template_effect(() => $.set_text(text, page.params.slug));
	$.append($$anchor, fragment);
	$.pop();
}