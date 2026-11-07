import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<pre> </pre>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var pre = root();
	var text = $.only_child(pre, true);

	$.template_effect(($0) => $.set_text(text, $0), [
		() => JSON.stringify({ status: page.status, ...page.error }, null, '  ')
	]);

	$.append($$anchor, pre);
	$.pop();
}