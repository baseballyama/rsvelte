import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const hi2 = ($$anchor, $$arg0) => {
	let a = $.derived_safe_equal(() => $.fallback($$arg0?.(), 1));

	$.next();

	var fragment = root();
	var node = $.sibling($.first_child(fragment));

	Test(node, {});
	$.append($$anchor, fragment);
};

var root = $.from_html(`hello world <!>`, 1);

export default function Input($$anchor) {
	hi2($$anchor, () => 1);
}