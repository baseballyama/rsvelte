import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.await(node, () => object, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { a = 3, b = 4, c } = $.get($$source);

			return { a, b, c };
		});

		var a = $.derived(() => $.get($$value).a);
		var b = $.derived(() => $.get($$value).b);
		var c = $.derived(() => $.get($$value).c);
		var text = $.text('then');

		$.append($$anchor, text);
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => array, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var [a, b, c = 3] = $.get($$source);

			return { a, b, c };
		});

		var a = $.derived(() => $.get($$value).a);
		var b = $.derived(() => $.get($$value).b);
		var c = $.derived(() => $.get($$value).c);
		var text_1 = $.text('then');

		$.append($$anchor, text_1);
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(
		node_2,
		() => objectReject,
		null,
		($$anchor, value) => {
			var text_2 = $.text('then');

			$.append($$anchor, text_2);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var { a = 3, b = 4, c } = $.get($$source);

				return { a, b, c };
			});

			var a = $.derived(() => $.get($$value).a);
			var b = $.derived(() => $.get($$value).b);
			var c = $.derived(() => $.get($$value).c);
			var text_3 = $.text('catch');

			$.append($$anchor, text_3);
		}
	);

	var node_3 = $.sibling(node_2, 2);

	$.await(
		node_3,
		() => arrayReject,
		null,
		($$anchor, value) => {
			var text_4 = $.text('then');

			$.append($$anchor, text_4);
		},
		($$anchor, $$source) => {
			var $$value = $.derived(() => {
				var [a, b, c = 3] = $.get($$source);

				return { a, b, c };
			});

			var a = $.derived(() => $.get($$value).a);
			var b = $.derived(() => $.get($$value).b);
			var c = $.derived(() => $.get($$value).c);
			var text_5 = $.text('catch');

			$.append($$anchor, text_5);
		}
	);

	$.append($$anchor, fragment);
}