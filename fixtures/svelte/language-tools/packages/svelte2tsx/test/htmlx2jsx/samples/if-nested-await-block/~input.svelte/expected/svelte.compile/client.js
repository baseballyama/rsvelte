import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.await(node_1, () => hello.foo, null, ($$anchor, y) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, $.get(y)));
				$.append($$anchor, text);
			});

			var node_2 = $.sibling(node_1, 2);

			$.await(node_2, () => x, null, ($$anchor, y) => {
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(y)));
				$.append($$anchor, text_1);
			});

			var node_3 = $.sibling(node_2, 2);

			$.await(node_3, () => aPromise, ($$anchor) => {
				var text_2 = $.text();

				text_2.nodeValue = hello;
				$.append($$anchor, text_2);
			});

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_5 = $.comment();
					var node_5 = $.first_child(fragment_5);

					$.await(
						node_5,
						() => x,
						null,
						($$anchor, y) => {
							var text_3 = $.text();

							$.template_effect(() => $.set_text(text_3, $.get(y)));
							$.append($$anchor, text_3);
						},
						($$anchor) => {
							var text_4 = $.text('z');

							$.append($$anchor, text_4);
						}
					);

					$.append($$anchor, fragment_5);
				};

				var consequent_1 = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_6 = $.first_child(fragment_7);

					$.await(
						node_6,
						() => x,
						($$anchor) => {
							var text_7 = $.text('loading');

							$.append($$anchor, text_7);
						},
						($$anchor, y) => {
							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, $.get(y)));
							$.append($$anchor, text_5);
						},
						($$anchor) => {
							var text_6 = $.text('z');

							$.append($$anchor, text_6);
						}
					);

					$.append($$anchor, fragment_7);
				};

				var alternate = ($$anchor) => {
					var fragment_9 = $.comment();
					var node_7 = $.first_child(fragment_9);

					$.await(node_7, () => x, null, ($$anchor, y) => {
						var text_8 = $.text();

						$.template_effect(() => $.set_text(text_8, $.get(y)));
						$.append($$anchor, text_8);
					});

					$.append($$anchor, fragment_9);
				};

				$.if(node_4, ($$render) => {
					if (hi && bye) $$render(consequent); else if (cool) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (hello) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
}