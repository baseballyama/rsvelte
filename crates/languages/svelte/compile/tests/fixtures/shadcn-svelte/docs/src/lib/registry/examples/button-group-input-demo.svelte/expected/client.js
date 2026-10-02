import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Search from "@lucide/svelte/icons/search";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Button_group_input_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Input(node_1, { placeholder: 'Search...' });

				var node_2 = $.sibling(node_1, 2);

				Button(node_2, {
					variant: 'outline',
					size: 'icon',
					'aria-label': 'Search',
					children: ($$anchor, $$slotProps) => {
						Search($$anchor, {});
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