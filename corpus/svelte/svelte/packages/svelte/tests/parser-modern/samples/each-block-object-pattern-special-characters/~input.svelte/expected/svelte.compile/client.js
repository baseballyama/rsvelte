import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.each(node, 16, () => x, $.index, ($$anchor, $$item) => {
		let y = $.derived_safe_equal(() => $.fallback($$item.y, 'z'));
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => x, $.index, ($$anchor, $$item) => {
		let y = $.derived_safe_equal(() => $.fallback($$item.y, '{'));
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 16, () => x, $.index, ($$anchor, $$item) => {
		let y = $.derived_safe_equal(() => $.fallback($$item.y, ']'));
	});

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 16, () => x, $.index, ($$anchor, $$item) => {
		let y = $.derived_safe_equal(() => $.fallback($$item.y, () => `${`"`}`, true));
	});

	var node_4 = $.sibling(node_3, 2);

	$.each(node_4, 16, () => x, $.index, ($$anchor, $$item) => {
		let y = $.derived_safe_equal(() => $.fallback($$item.y, () => `${`John`}`, true));
	});

	$.append($$anchor, fragment);
}