import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PUBLIC_PRERENDERING } from '$app/env/public';

var root = $.from_html(`<h2> </h2>`);

export default function _page($$anchor) {
	var h2 = root();
	var text = $.only_child(h2);

	$.template_effect(() => $.set_text(text, `prerendering: ${PUBLIC_PRERENDERING ?? ''}`));
	$.append($$anchor, h2);
}