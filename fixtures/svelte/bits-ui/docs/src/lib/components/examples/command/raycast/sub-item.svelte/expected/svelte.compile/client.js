import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Command } from "bits-ui";

var root = $.from_html(`<kbd> </kbd>`);
var root_1 = $.from_html(`<!> <div data-command-raycast-submenu-shortcuts=""></div>`, 1);

export default function Sub_item($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Command.Item, ($$anchor, Command_Item) => {
		Command_Item($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children ?? $.noop);

				var div = $.sibling(node_1, 2);

				$.each(div, 21, () => $$props.shortcut.split(" "), $.index, ($$anchor, key) => {
					var kbd = root();
					var text = $.only_child(kbd, true);

					$.template_effect(() => $.set_text(text, $.get(key)));
					$.append($$anchor, kbd);
				});

				$.reset(div);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}