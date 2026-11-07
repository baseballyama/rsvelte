import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BookmarkIcon from "@lucide/svelte/icons/bookmark";
import HeartIcon from "@lucide/svelte/icons/heart";
import StarIcon from "@lucide/svelte/icons/star";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

var root = $.from_html(`<!> Star`, 1);
var root_1 = $.from_html(`<!> Heart`, 1);
var root_2 = $.from_html(`<!> Bookmark`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Toggle_group_spacing($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
		ToggleGroup_Root($$anchor, {
			type: 'multiple',
			variant: 'outline',
			spacing: 2,
			size: 'sm',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
					ToggleGroup_Item($$anchor, {
						value: 'star',
						'aria-label': 'Toggle star',
						class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-yellow-500 data-[state=on]:*:[svg]:stroke-yellow-500',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							StarIcon(node_2, {});
							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
					ToggleGroup_Item_1($$anchor, {
						value: 'heart',
						'aria-label': 'Toggle heart',
						class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-red-500 data-[state=on]:*:[svg]:stroke-red-500',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_4 = $.first_child(fragment_3);

							HeartIcon(node_4, {});
							$.next();
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_5 = $.sibling(node_3, 2);

				$.component(node_5, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
					ToggleGroup_Item_2($$anchor, {
						value: 'bookmark',
						'aria-label': 'Toggle bookmark',
						class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-blue-500 data-[state=on]:*:[svg]:stroke-blue-500',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var node_6 = $.first_child(fragment_4);

							BookmarkIcon(node_6, {});
							$.next();
							$.append($$anchor, fragment_4);
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