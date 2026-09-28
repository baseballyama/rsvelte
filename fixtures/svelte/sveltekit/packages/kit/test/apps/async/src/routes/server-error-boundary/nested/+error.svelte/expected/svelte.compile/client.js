import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<p id="nested-error-message"> </p>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Nested error: ${$$props.error.message ?? ''} | ${page.error?.message === $$props.error.message} | ${page.status ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}