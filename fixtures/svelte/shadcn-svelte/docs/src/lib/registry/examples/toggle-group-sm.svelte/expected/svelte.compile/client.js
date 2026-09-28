import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BoldIcon from "@lucide/svelte/icons/bold";
import ItalicIcon from "@lucide/svelte/icons/italic";
import UnderlineIcon from "@lucide/svelte/icons/underline";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Toggle_group_sm($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
		ToggleGroup_Root($$anchor, {
			size: 'sm',
			type: 'single',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
					ToggleGroup_Item($$anchor, {
						value: 'bold',
						'aria-label': 'Toggle bold',
						children: ($$anchor, $$slotProps) => {
							BoldIcon($$anchor, { class: 'size-4' });
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
					ToggleGroup_Item_1($$anchor, {
						value: 'italic',
						'aria-label': 'Toggle italic',
						children: ($$anchor, $$slotProps) => {
							ItalicIcon($$anchor, { class: 'size-4' });
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
					ToggleGroup_Item_2($$anchor, {
						value: 'strikethrough',
						'aria-label': 'Toggle strikethrough',
						children: ($$anchor, $$slotProps) => {
							UnderlineIcon($$anchor, { class: 'size-4' });
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}