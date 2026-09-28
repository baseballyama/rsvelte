import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Toggle_group_vertical_outline_with_icons($$anchor) {
	Example($$anchor, {
		title: 'Vertical Outline With Icons',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
				ToggleGroup_Root($$anchor, {
					variant: 'outline',
					type: 'multiple',
					orientation: 'vertical',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
							ToggleGroup_Item($$anchor, {
								value: 'bold',
								'aria-label': 'Toggle bold',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'BoldIcon',
										tabler: 'IconBold',
										hugeicons: 'TextBoldIcon',
										phosphor: 'TextBIcon',
										remixicon: 'RiBold'
									});
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
									IconPlaceholder($$anchor, {
										lucide: 'ItalicIcon',
										tabler: 'IconItalic',
										hugeicons: 'TextItalicIcon',
										phosphor: 'TextItalicIcon',
										remixicon: 'RiItalic'
									});
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
							ToggleGroup_Item_2($$anchor, {
								value: 'underline',
								'aria-label': 'Toggle underline',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'UnderlineIcon',
										tabler: 'IconUnderline',
										hugeicons: 'TextUnderlineIcon',
										phosphor: 'TextUnderlineIcon',
										remixicon: 'RiUnderline'
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}