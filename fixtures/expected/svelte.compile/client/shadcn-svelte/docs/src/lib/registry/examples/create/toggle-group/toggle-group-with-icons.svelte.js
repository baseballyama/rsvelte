import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Star`, 1);
var root_1 = $.from_html(`<!> Heart`, 1);
var root_2 = $.from_html(`<!> Bookmark`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Toggle_group_with_icons($$anchor) {
	Example($$anchor, {
		title: 'With Icons',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
				ToggleGroup_Root($$anchor, {
					type: 'multiple',
					variant: 'outline',
					spacing: 2,
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
							ToggleGroup_Item($$anchor, {
								value: 'star',
								'aria-label': 'Toggle star',
								class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-foreground data-[state=on]:*:[svg]:stroke-foreground',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									IconPlaceholder(node_2, {
										lucide: 'StarIcon',
										tabler: 'IconStar',
										hugeicons: 'StarIcon',
										phosphor: 'StarIcon',
										remixicon: 'RiStarLine'
									});

									$.next();
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
							ToggleGroup_Item_1($$anchor, {
								value: 'heart',
								'aria-label': 'Toggle heart',
								class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-foreground data-[state=on]:*:[svg]:stroke-foreground',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_4 = $.first_child(fragment_4);

									IconPlaceholder(node_4, {
										lucide: 'HeartIcon',
										tabler: 'IconHeart',
										hugeicons: 'FavouriteIcon',
										phosphor: 'HeartIcon',
										remixicon: 'RiHeartLine'
									});

									$.next();
									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
							ToggleGroup_Item_2($$anchor, {
								value: 'bookmark',
								'aria-label': 'Toggle bookmark',
								class: 'data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-foreground data-[state=on]:*:[svg]:stroke-foreground',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var node_6 = $.first_child(fragment_5);

									IconPlaceholder(node_6, {
										lucide: 'BookmarkIcon',
										tabler: 'IconBookmark',
										hugeicons: 'BookmarkIcon',
										phosphor: 'BookmarkIcon',
										remixicon: 'RiBookmarkLine'
									});

									$.next();
									$.append($$anchor, fragment_5);
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