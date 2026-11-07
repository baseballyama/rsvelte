import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!>`, 1);

export default function Input($$anchor, $$props) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			Input(node_1, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const prop = $.derived(() => $$slotProps.prop);
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.slot(
							node_2,
							$$props,
							'default',
							{
								get prop() {
									return $.get(prop);
								}
							},
							null
						);

						$.append($$anchor, fragment_2);
					}
				}
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => testComponent, ($$anchor, $$component) => {
		$$component($$anchor, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$anchor, $$slotProps) => {
					const prop = $.derived(() => $$slotProps.prop);
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.slot(
						node_4,
						$$props,
						'default',
						{
							get prop() {
								return $.get(prop);
							}
						},
						null
					);

					$.append($$anchor, fragment_3);
				}
			}
		});
	});

	$.append($$anchor, fragment);
}