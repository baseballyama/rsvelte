import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';

var root = $.from_html(`<a id="resolved-link">go up</a>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var a = root();

	$.template_effect(($0) => $.set_attribute(a, 'href', $0), [() => resolve('/resolve-relative/lv1')]);
	$.append($$anchor, a);
	$.pop();
}