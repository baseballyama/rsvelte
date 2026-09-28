import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Main($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const prop = ($$anchor) => {
			const foo = $.derived(() => 'bar');

			$.next();

			var text = $.text();

			text.nodeValue = $.get(foo);
			$.append($$anchor, text);
		};

		Component(node, {
			prop,
			children: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => 'bar');

				$.next();

				var fragment_2 = root();
				var text_1 = $.first_child(fragment_2);

				text_1.nodeValue = `${$.get(foo) ?? ''} `;

				var node_1 = $.sibling(text_1);

				{
					const prop = ($$anchor) => {
						$.next();

						var text_2 = $.text();

						text_2.nodeValue = $.get(foo);
						$.append($$anchor, text_2);
					};

					Component(node_1, { prop, $$slots: { prop: true } });
				}

				$.append($$anchor, fragment_2);
			},
			$$slots: { prop: true, default: true }
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		const prop = ($$anchor) => {
			$.next();

			var text_3 = $.text();

			text_3.nodeValue = 'bar';
			$.append($$anchor, text_3);
		};

		Component(node_2, {
			prop,
			children: ($$anchor, $$slotProps) => {
				const foo = $.derived(() => 'bar');
			},
			$$slots: { prop: true, default: true }
		});
	}

	$.append($$anchor, fragment);
}