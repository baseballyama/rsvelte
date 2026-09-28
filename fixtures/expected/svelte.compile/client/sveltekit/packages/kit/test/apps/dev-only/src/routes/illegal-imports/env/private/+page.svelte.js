import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SHOULD_EXPLODE } from '$app/env/private';

var root = $.from_html(`<p> </p>`);

export default function _page($$anchor) {
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, SHOULD_EXPLODE));
	$.append($$anchor, p);
}