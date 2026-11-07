import * as $ from 'svelte/internal/server';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_vertical_nested($$renderer) {
	Example($$renderer, {
		title: 'Vertical Nested',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				orientation: 'vertical',
				'aria-label': 'Design tools palette',
				children: ($$renderer) => {
					ButtonGroup($$renderer, {
						orientation: 'vertical',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'SearchIcon',
										tabler: 'IconSearch',
										hugeicons: 'Search01Icon',
										phosphor: 'MagnifyingGlassIcon',
										remixicon: 'RiSearchLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'CopyIcon',
										tabler: 'IconCopy',
										hugeicons: 'Copy01Icon',
										phosphor: 'CopyIcon',
										remixicon: 'RiFileCopyLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'ShareIcon',
										tabler: 'IconShare',
										hugeicons: 'Share03Icon',
										phosphor: 'ShareIcon',
										remixicon: 'RiShareLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ButtonGroup($$renderer, {
						orientation: 'vertical',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'FlipHorizontalIcon',
										tabler: 'IconFlipHorizontal',
										hugeicons: 'FlipHorizontalIcon',
										phosphor: 'ArrowsHorizontalIcon',
										remixicon: 'RiFlipHorizontalLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'FlipVerticalIcon',
										tabler: 'IconFlipVertical',
										hugeicons: 'FlipVerticalIcon',
										phosphor: 'ArrowsVerticalIcon',
										remixicon: 'RiFlipVerticalLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'RotateCwIcon',
										tabler: 'IconRotateClockwise2',
										hugeicons: 'Rotate01Icon',
										phosphor: 'ArrowClockwiseIcon',
										remixicon: 'RiRefreshLine'
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ButtonGroup($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}