import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => promise,
		null,
		($$anchor, value) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.slot(
				node_1,
				$$props,
				'default',
				{
					get a() {
						return $.get(value);
					}
				},
				($$anchor) => {
					var text = $.text('Hello');

					$.append($$anchor, text);
				}
			);

			$.append($$anchor, fragment_1);
		},
		($$anchor, err) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.slot(
				node_2,
				$$props,
				'err',
				{
					get err() {
						return $.get(err);
					}
				},
				($$anchor) => {
					var text_1 = $.text('Hello');

					$.append($$anchor, text_1);
				}
			);

			$.append($$anchor, fragment_2);
		}
	);

	var node_3 = $.sibling(node, 2);

	$.await(node_3, () => promise2, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { b } = $.get($$source);

			return { b };
		});

		var b = $.derived(() => $.get($$value).b);
		var fragment_3 = $.comment();
		var node_4 = $.first_child(fragment_3);

		$.slot(
			node_4,
			$$props,
			'second',
			{
				get a() {
					return $.get(b);
				}
			},
			($$anchor) => {
				var text_2 = $.text('Hello');

				$.append($$anchor, text_2);
			}
		);

		$.append($$anchor, fragment_3);
	});

	$.append($$anchor, fragment);
}