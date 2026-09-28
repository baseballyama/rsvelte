import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<div class="placeholder svelte-1j96wlh"> </div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var text = $.only_child(div, true);

	$.template_effect(() => $.set_text(text, page.error?.message));
	$.append($$anchor, div);
	$.pop();
}