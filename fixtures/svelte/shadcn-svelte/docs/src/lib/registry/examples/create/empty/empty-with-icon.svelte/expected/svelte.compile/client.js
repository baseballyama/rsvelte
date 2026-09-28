import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Empty from "$lib/registry/ui/empty/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`No posts have been created yet. Get started by <a href="#/">creating your first post</a>.`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> New Post`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Empty_with_icon($$anchor) {
	Example($$anchor, {
		title: 'With Icon',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
				Empty_Root($$anchor, {
					class: 'border',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
							Empty_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
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

												var text = $.text('Nothing to see here');

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

												var fragment_5 = root();

												$.next(2);
												$.append($$anchor, fragment_5);
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
									Button($$anchor, {
										variant: 'outline',
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_2();
											var node_6 = $.first_child(fragment_7);

											IconPlaceholder(node_6, {
												lucide: 'PlusIcon',
												tabler: 'IconPlus',
												hugeicons: 'PlusSignIcon',
												phosphor: 'PlusIcon',
												remixicon: 'RiAddLine',
												'data-icon': 'inline-start'
											});

											$.next();
											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
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