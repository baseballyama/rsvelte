import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`Learn more <!>`, 1);
var root_2 = $.from_html(`<div class="flex gap-2"><!> <!></div> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Empty_in_card($$anchor) {
	Example($$anchor, {
		title: 'In Card',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
				Empty_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
							Empty_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Empty.Media, ($$anchor, Empty_Media) => {
										Empty_Media($$anchor, {
											variant: 'icon',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'FolderIcon',
													tabler: 'IconFolder',
													hugeicons: 'Folder01Icon',
													phosphor: 'FolderIcon',
													remixicon: 'RiFolderLine'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Empty.Title, ($$anchor, Empty_Title) => {
										Empty_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('No projects yet');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Empty.Description, ($$anchor, Empty_Description) => {
										Empty_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('You haven\'t created any projects yet. Get started by creating your first project.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_5 = $.sibling(node_1, 2);

						$.component(node_5, () => Empty.Content, ($$anchor, Empty_Content) => {
							Empty_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_2();
									var div = $.first_child(fragment_5);
									var node_6 = $.child(div);

									Button(node_6, {
										href: '#/',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Create project');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									Button(node_7, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Import project');

											$.append($$anchor, text_3);
										},
										$$slots: { default: true }
									});

									$.reset(div);

									var node_8 = $.sibling(div, 2);

									Button(node_8, {
										variant: 'link',
										href: '#/',
										class: 'text-muted-foreground',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_6 = root_1();
											var node_9 = $.sibling($.first_child(fragment_6));

											IconPlaceholder(node_9, {
												lucide: 'ArrowUpRightIcon',
												tabler: 'IconArrowUpRight',
												hugeicons: 'ArrowUpRight01Icon',
												phosphor: 'ArrowUpRightIcon',
												remixicon: 'RiArrowRightUpLine'
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

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