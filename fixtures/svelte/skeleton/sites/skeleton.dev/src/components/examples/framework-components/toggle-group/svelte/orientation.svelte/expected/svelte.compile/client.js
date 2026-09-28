import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BoldIcon from '@lucide/svelte/icons/bold';
import ItalicIcon from '@lucide/svelte/icons/italic';
import UnderlineIcon from '@lucide/svelte/icons/underline';
import { ToggleGroup } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col items-center gap-4"><p>Horizontal</p> <!> <p>Vertical</p> <!></div>`);

export default function Orientation($$anchor) {
	var div = root_1();
	var node = $.sibling($.child(div), 2);

	ToggleGroup(node, {
		defaultValue: ['bold'],
		multiple: true,
		orientation: 'horizontal',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
				ToggleGroup_Item($$anchor, {
					value: 'bold',
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
					children: ($$anchor, $$slotProps) => {
						ItalicIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node_2, 2);

			$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
				ToggleGroup_Item_2($$anchor, {
					value: 'underline',
					children: ($$anchor, $$slotProps) => {
						UnderlineIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 4);

	ToggleGroup(node_4, {
		defaultValue: ['bold'],
		multiple: true,
		orientation: 'vertical',
		class: 'flex-col',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_5 = $.first_child(fragment_4);

			$.component(node_5, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_3) => {
				ToggleGroup_Item_3($$anchor, {
					value: 'bold',
					children: ($$anchor, $$slotProps) => {
						BoldIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_4) => {
				ToggleGroup_Item_4($$anchor, {
					value: 'italic',
					children: ($$anchor, $$slotProps) => {
						ItalicIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			var node_7 = $.sibling(node_6, 2);

			$.component(node_7, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_5) => {
				ToggleGroup_Item_5($$anchor, {
					value: 'underline',
					children: ($$anchor, $$slotProps) => {
						UnderlineIcon($$anchor, { class: 'size-4' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}