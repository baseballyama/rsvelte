import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<pre> </pre>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var pre = root();

	$.set_style(pre, '', {}, { color: 'red' });

	var text = $.only_child(pre, true);

	$.template_effect(() => $.set_text(text, page.error?.message));
	$.append($$anchor, pre);
	$.pop();
}