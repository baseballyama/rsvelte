import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Minus from "@lucide/svelte/icons/minus";
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Button_group_orientation_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			orientation: 'vertical',
			'aria-label': 'Media controls',
			class: 'h-fit',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				Button(node_1, {
					variant: 'outline',
					size: 'icon',
					children: ($$anchor, $$slotProps) => {
						Plus($$anchor, {});
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Button(node_2, {
					variant: 'outline',
					size: 'icon',
					children: ($$anchor, $$slotProps) => {
						Minus($$anchor, {});
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