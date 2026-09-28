import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const one = ($$anchor, a = $.noop, $$arg1, $$arg2) => {
	let b = $.derived_safe_equal(() => $.fallback($$arg1?.(), 1));
	let c = $.derived_safe_equal(() => $.fallback($$arg2?.(), () => (2, 3), true));

	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, `${a() ?? ''}${$.get(b) ?? ''}${$.get(c) ?? ''}`));
	$.append($$anchor, text);
};

const two = ($$anchor, a = $.noop, $$arg1, $$arg2) => {
	let b = $.derived_safe_equal(() => $.fallback($$arg1?.(), () => (1, 2), true));
	let c = $.derived_safe_equal(() => $.fallback($$arg2?.(), 3));

	$.next();

	var text_1 = $.text();

	$.template_effect(() => $.set_text(text_1, `${a() ?? ''}${$.get(b) ?? ''}${$.get(c) ?? ''}`));
	$.append($$anchor, text_1);
};

var root = $.from_html(`<!>/<!>`, 1);

export default function Main($$anchor) {
	var fragment_2 = root();
	var node = $.first_child(fragment_2);

	one(node, () => 0);

	var node_1 = $.sibling(node, 2);

	two(node_1, () => 0);
	$.append($$anchor, fragment_2);
}