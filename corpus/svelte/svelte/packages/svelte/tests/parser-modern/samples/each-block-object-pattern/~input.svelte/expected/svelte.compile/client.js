import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 16, () => people, $.index, ($$anchor, $$item) => {
		let name = () => $$item.name;
		let cool = $.derived_safe_equal(() => $.fallback($$item.cool, true));
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `${name() ?? ''} is ${$.get(cool) ? 'cool' : 'not cool'}`));
		$.append($$anchor, p);
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => people, $.index, ($$anchor, $$item) => {
		let name = $.derived_safe_equal(() => $.fallback($$item.name, () => `Jane ${"Doe"}`, true));
		let cool = $.derived_safe_equal(() => $.fallback($$item.cool, true));
		var p_1 = root();
		var text_1 = $.only_child(p_1);

		$.template_effect(() => $.set_text(text_1, `${$.get(name) ?? ''} is ${$.get(cool) ? 'cool' : 'not cool'}`));
		$.append($$anchor, p_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 16, () => people, $.index, ($$anchor, $$item) => {
		let name = $.derived_safe_equal(() => $.fallback(
			$$item.name,
			() => (() => {
				return `Jane ${"Doe"}`;
			})(),
			true
		));

		let cool = $.derived_safe_equal(() => $.fallback($$item.cool, true));
		var p_2 = root();
		var text_2 = $.only_child(p_2);

		$.template_effect(() => $.set_text(text_2, `${$.get(name) ?? ''} is ${$.get(cool) ? 'cool' : 'not cool'}`));
		$.append($$anchor, p_2);
	});

	$.append($$anchor, fragment);
}