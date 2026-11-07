import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 16, () => items, $.index, ($$anchor, item) => {
		var fragment_1 = root();
		var node_1 = $.first_child(fragment_1);

		$.each(node_1, 17, () => item, $.index, ($$anchor, $$item) => {
			let a = () => $.get($$item).a;
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.slot(
				node_2,
				$$props,
				'default',
				{
					get a() {
						return a();
					}
				},
				($$anchor) => {
					var text = $.text('Hello');

					$.append($$anchor, text);
				}
			);

			$.append($$anchor, fragment_2);
		});

		var node_3 = $.sibling(node_1, 2);

		$.slot(node_3, $$props, 'second', { a }, null);
		$.append($$anchor, fragment_1);
	});

	var node_4 = $.sibling(node, 2);

	Component(node_4, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const c = $.derived(() => $$slotProps.c);

				$.next();

				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(c)));
				$.append($$anchor, text_1);
			}
		}
	});

	var node_5 = $.sibling(node_4, 2);

	$.await(node_5, () => promise, null, ($$anchor, d) => {
		var text_2 = $.text();

		$.template_effect(() => $.set_text(text_2, $.get(d)));
		$.append($$anchor, text_2);
	});

	var node_6 = $.sibling(node_5, 2);

	$.slot(node_6, $$props, 'third', { d, c }, null);
	$.append($$anchor, fragment);
}