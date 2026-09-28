import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { version } from '$app/env';

var root = $.from_html(`<h1> </h1>`);

export default function _page($$anchor) {
	var h1 = root();
	var text = $.only_child(h1, true);

	$.template_effect(() => $.set_text(text, version));
	$.append($$anchor, h1);
}