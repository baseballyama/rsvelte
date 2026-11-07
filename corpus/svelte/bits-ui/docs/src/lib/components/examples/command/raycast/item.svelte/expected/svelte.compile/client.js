import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";

var root = $.from_html(`<!> <span data-command-raycast-meta=""><!></span>`, 1);

export default function Item($$anchor, $$props) {
	let isCommand = $.prop($$props, 'isCommand', 3, false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Item, ($$anchor, Command_Item) => {
		Command_Item($$anchor, {
			get value() {
				return $$props.value;
			},

			get onSelect() {
				return $$props.onSelect;
			},

			get keywords() {
				return $$props.keywords;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);

				var span = $.sibling(node_1, 2);
				var node_2 = $.child(span);

				{
					var consequent = ($$anchor) => {
						var text = $.text('Command');

						$.append($$anchor, text);
					};

					var alternate = ($$anchor) => {
						var text_1 = $.text('Application');

						$.append($$anchor, text_1);
					};

					$.if(node_2, ($$render) => {
						if (isCommand()) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.reset(span);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}