import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'href']);
var root = $.from_html(`<a>link</a> <a>bad tabindex</a>`, 1);

export default function Spread_ts($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	const wrong = { tabindex: 'first' };
	var fragment = root();
	var a = $.first_child(fragment);

	$.attribute_effect(a, () => ({ href: $$props.href, ...rest }));

	var a_1 = $.sibling(a, 2);

	$.attribute_effect(a_1, () => ({ ...wrong }));
	$.append($$anchor, fragment);
}