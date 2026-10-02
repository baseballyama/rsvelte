import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Button_group_vertical_nested($$anchor) {
	Example($$anchor, {
		title: 'Vertical Nested',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				orientation: 'vertical',
				'aria-label': 'Design tools palette',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					ButtonGroup(node, {
						orientation: 'vertical',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							Button(node_1, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'SearchIcon',
										tabler: 'IconSearch',
										hugeicons: 'Search01Icon',
										phosphor: 'MagnifyingGlassIcon',
										remixicon: 'RiSearchLine'
									});
								},
								$$slots: { default: true }
							});

							var node_2 = $.sibling(node_1, 2);

							Button(node_2, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'CopyIcon',
										tabler: 'IconCopy',
										hugeicons: 'Copy01Icon',
										phosphor: 'CopyIcon',
										remixicon: 'RiFileCopyLine'
									});
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Button(node_3, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'ShareIcon',
										tabler: 'IconShare',
										hugeicons: 'Share03Icon',
										phosphor: 'ShareIcon',
										remixicon: 'RiShareLine'
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node, 2);

					ButtonGroup(node_4, {
						orientation: 'vertical',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_5 = $.first_child(fragment_7);

							Button(node_5, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'FlipHorizontalIcon',
										tabler: 'IconFlipHorizontal',
										hugeicons: 'FlipHorizontalIcon',
										phosphor: 'ArrowsHorizontalIcon',
										remixicon: 'RiFlipHorizontalLine'
									});
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Button(node_6, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'FlipVerticalIcon',
										tabler: 'IconFlipVertical',
										hugeicons: 'FlipVerticalIcon',
										phosphor: 'ArrowsVerticalIcon',
										remixicon: 'RiFlipVerticalLine'
									});
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							Button(node_7, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'RotateCwIcon',
										tabler: 'IconRotateClockwise2',
										hugeicons: 'Rotate01Icon',
										phosphor: 'ArrowClockwiseIcon',
										remixicon: 'RiRefreshLine'
									});
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_4, 2);

					ButtonGroup(node_8, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'outline',
								size: 'icon',
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'TrashIcon',
										tabler: 'IconTrash',
										hugeicons: 'Delete02Icon',
										phosphor: 'TrashIcon',
										remixicon: 'RiDeleteBinLine'
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}