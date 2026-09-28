import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1>a</h1> <p> </p>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `active: ${page.state.active ?? false ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}