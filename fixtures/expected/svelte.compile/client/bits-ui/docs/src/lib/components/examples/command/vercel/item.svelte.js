import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";

var root = $.from_html(`<kbd> </kbd>`);
var root_1 = $.from_html(`<div data-command-vercel-shortcuts=""></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	let shortcut = $.prop($$props, 'shortcut', 3, ""),
		onSelect = $.prop($$props, 'onSelect', 3, () => {});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Item, ($$anchor, Command_Item) => {
		Command_Item($$anchor, {
			get onSelect() {
				return onSelect();
			},

			get value() {
				return $$props.value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent = ($$anchor) => {
						var div = root_1();

						$.each(div, 20, () => shortcut().split(" "), (key) => key, ($$anchor, key) => {
							var kbd = root();
							var text = $.only_child(kbd, true);

							$.template_effect(() => $.set_text(text, key));
							$.append($$anchor, kbd);
						});

						$.reset(div);
						$.append($$anchor, div);
					};

					$.if(node_2, ($$render) => {
						if (shortcut()) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}