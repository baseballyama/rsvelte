import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/env';

var root = $.from_html(`<h2 data-testid="a"> </h2>`);

export default function _page($$anchor) {
	var h2 = root();
	var text = $.only_child(h2);

	$.template_effect(() => $.set_text(text, `a (${browser ? 'browser' : 'server'})`));
	$.append($$anchor, h2);
}