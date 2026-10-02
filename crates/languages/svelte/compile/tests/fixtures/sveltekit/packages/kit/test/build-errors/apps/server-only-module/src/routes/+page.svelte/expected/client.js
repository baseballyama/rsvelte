import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { should_explode } from '#lib/test.server.js';

var root = $.from_html(`<p> </p>`);

export default function _page($$anchor) {
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, should_explode));
	$.append($$anchor, p);
}