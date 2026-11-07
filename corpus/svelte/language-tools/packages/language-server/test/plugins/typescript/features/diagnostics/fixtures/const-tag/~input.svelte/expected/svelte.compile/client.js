import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	const promise = Promise.resolve({ foo: true });
	const shadowed = true;

	shadowed;

	var fragment = root();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => promise,
		null,
		($$anchor, result) => {
			const bar = $.derived(() => $.get(result));
			const str = $.derived(() => "hello");
			const shadowed = $.derived(() => "shadowed");
			var text = $.text();

			$.template_effect(() => $.set_text(text, `${$.get(bar) === $.get(result)}
    ${$.get(str) === "hello"}
    ${$.get(shadowed) === "shadowed"}`));

			$.append($$anchor, text);
		},
		($$anchor, e) => {
			const bar = $.derived(() => $.get(e));
			const str = $.derived(() => "hello");
			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, `${$.get(bar) ?? ''}
    ${$.get(str) === "hello"}`));

			$.append($$anchor, text_1);
		}
	);

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => [1, 2], $.index, ($$anchor, item, $$index, $$array) => {
		const x = $.derived(() => item * 2);
		const shadowed = $.derived(() => item * 3);

		$.next();

		var text_2 = $.text();

		$.template_effect(() => $.set_text(text_2, $.get(x) === $.get(shadowed)));
		$.append($$anchor, text_2);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => promise,
		null,
		($$anchor, result) => {
			const unused = $.derived(() => doesntExist);
			const str = $.derived(() => "hello");
			var text_3 = $.text();

			text_3.nodeValue = $.get(str) === true;
			$.append($$anchor, text_3);
		},
		($$anchor, e) => {
			const unused = $.derived(() => doesntExist);
			const str = $.derived(() => "hello");
			var text_4 = $.text();

			text_4.nodeValue = $.get(str) === true;
			$.append($$anchor, text_4);
		}
	);

	var node_3 = $.sibling(node_2, 2);

	$.each(node_3, 16, () => [1, 2], $.index, ($$anchor, item) => {
		const unused = $.derived(() => doesntExist);
		const x = $.derived(() => item * 2);

		$.next();

		var text_5 = $.text();

		$.template_effect(() => $.set_text(text_5, $.get(x) === "asd"));
		$.append($$anchor, text_5);
	});

	$.append($$anchor, fragment);
}