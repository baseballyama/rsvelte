import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Button_group_split_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Button(node_1, {
					variant: 'secondary',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Button');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ButtonGroup.Separator, ($$anchor, ButtonGroup_Separator) => {
					ButtonGroup_Separator($$anchor, {});
				});

				var node_3 = $.sibling(node_2, 2);

				Button(node_3, {
					variant: 'secondary',
					size: 'icon',
					children: ($$anchor, $$slotProps) => {
						Plus($$anchor, {});
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}