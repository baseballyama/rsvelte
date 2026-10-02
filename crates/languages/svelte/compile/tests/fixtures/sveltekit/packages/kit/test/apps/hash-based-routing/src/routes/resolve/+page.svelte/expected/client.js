import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<a>go to home</a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var a = root();

	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve('/')]);
	$.append($$anchor, a);
	$.pop();
}