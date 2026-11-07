import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<a>go to dynamic</a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var a = root();

	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve('/dynamic/[id]', { id: '1' })]);
	$.append($$anchor, a);
	$.pop();
}