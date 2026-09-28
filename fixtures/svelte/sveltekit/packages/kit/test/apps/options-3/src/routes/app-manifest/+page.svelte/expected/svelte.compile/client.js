import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { immutable } from '$app/manifest';

var root = $.from_html(`<pre> </pre>`);

export default function _page($$anchor) {
	var pre = root();
	var text = $.only_child(pre, true);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify(immutable)]);
	$.append($$anchor, pre);
}