import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PUBLIC_VALUE } from '$app/env/public';

var root = $.from_html(`<h1>the fallback page was rendered</h1> <b> </b>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var b = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(b, true);

	$.template_effect(() => $.set_text(text, PUBLIC_VALUE));
	$.append($$anchor, fragment);
}