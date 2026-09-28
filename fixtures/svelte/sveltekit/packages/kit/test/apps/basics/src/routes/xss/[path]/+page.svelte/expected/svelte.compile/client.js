import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1 id="one"> </h1>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, page.params.path));
	$.append($$anchor, h1);
	$.pop();
}