import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<h1 class="destination-error"> </h1>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var h1 = root();
	var text = $.only_child(h1);

	$.template_effect(() => $.set_text(text, `destination error: ${page.error?.message ?? ''}`));
	$.append($$anchor, h1);
	$.pop();
}