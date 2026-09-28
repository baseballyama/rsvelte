import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BoldIcon from '@lucide/svelte/icons/bold';
import ItalicIcon from '@lucide/svelte/icons/italic';
import UnderlineIcon from '@lucide/svelte/icons/underline';
import { ToggleGroup } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor) {
	ToggleGroup($$anchor, {
		defaultValue: ['bold'],
		multiple: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
				ToggleGroup_Item($$anchor, {
					value: 'bold',
					children: ($$anchor, $$slotProps) => {
						BoldIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
				ToggleGroup_Item_1($$anchor, {
					value: 'italic',
					children: ($$anchor, $$slotProps) => {
						ItalicIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
				ToggleGroup_Item_2($$anchor, {
					value: 'underline',
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
}