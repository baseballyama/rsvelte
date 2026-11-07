import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div slot="label"><!></div>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor, $$props) {
	const $$slots = $.sanitize_slots($$props);
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.slot(node_1, $$props, 'label', {}, null);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$slots.label) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	MyInput(node_2, {
		$$slots: {
			label: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.slot(node_3, $$props, 'label', {}, null);
				$.append($$anchor, fragment_2);
			}
		}
	});

	var node_4 = $.sibling(node_2, 2);

	MyInput(node_4, {
		$$slots: {
			label: ($$anchor, $$slotProps) => {
				var div = root();
				var node_5 = $.child(div);

				MyComponent(node_5, {
					$$slots: {
						label: ($$anchor, $$slotProps) => {
							var div_1 = root();
							var node_6 = $.child(div_1);

							$.slot(node_6, $$props, 'label', {}, null);
							$.reset(div_1);
							$.append($$anchor, div_1);
						}
					}
				});

				$.reset(div);
				$.append($$anchor, div);
			}
		}
	});

	var node_7 = $.sibling(node_4, 2);

	MyInput(node_7, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_3 = $.comment();
				var node_8 = $.first_child(fragment_3);

				$.slot(node_8, $$props, 'default', {}, null);
				$.append($$anchor, fragment_3);
			}
		}
	});

	var node_9 = $.sibling(node_7, 2);

	MyInput(node_9, {
		children: ($$anchor, $$slotProps) => {
			const args = $.derived(() => $$slotProps.args);
			var div_2 = root_1();
			var node_10 = $.child(div_2);

			$.slot(node_10, $$props, 'default', {}, null);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}