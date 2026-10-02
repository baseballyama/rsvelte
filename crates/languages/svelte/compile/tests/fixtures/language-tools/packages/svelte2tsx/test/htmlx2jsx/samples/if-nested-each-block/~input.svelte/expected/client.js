import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<p>hi</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = root_2();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 18, () => items, (item) => item.id, ($$anchor, item, i) => {
				var div = root();
				var text = $.only_child(div);

				$.template_effect(() => $.set_text(text, `${item ?? ''}${$.get(i) ?? ''}`));
				$.append($$anchor, div);
			});

			var node_2 = $.sibling(node_1, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_3 = $.first_child(fragment_2);

					$.each(
						node_3,
						16,
						() => items,
						$.index,
						($$anchor, item) => {
							var div_1 = root();
							var text_1 = $.only_child(div_1, true);

							$.template_effect(() => $.set_text(text_1, item));
							$.append($$anchor, div_1);
						},
						($$anchor) => {
							var p = root_1();

							$.append($$anchor, p);
						}
					);

					$.append($$anchor, fragment_2);
				};

				var consequent_1 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.each(node_4, 16, () => items, $.index, ($$anchor, item, i) => {
						var div_2 = root();
						var text_2 = $.only_child(div_2);

						$.template_effect(() => $.set_text(text_2, `${item ?? ''}${i}`));
						$.append($$anchor, div_2);
					});

					$.append($$anchor, fragment_3);
				};

				var alternate = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_5 = $.first_child(fragment_4);

					$.each(node_5, 16, () => items, $.index, ($$anchor, item) => {
						var div_3 = root();
						var text_3 = $.only_child(div_3, true);

						$.template_effect(() => $.set_text(text_3, item));
						$.append($$anchor, div_3);
					});

					$.append($$anchor, fragment_4);
				};

				$.if(node_2, ($$render) => {
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