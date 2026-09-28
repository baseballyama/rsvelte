import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<img src="https://avatar.vercel.sh/Project" alt="Project" class="object-cover grayscale"/>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<img src="https://avatar.vercel.sh/Document" alt="Document" class="object-cover grayscale"/>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<img src="https://avatar.vercel.sh/File" alt="File" class="object-cover grayscale"/>`);

export default function Item_outline_image_extra_small($$anchor) {
	Example($$anchor, {
		title: 'Outline - ItemMedia image - Extra Small',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					variant: 'outline',
					size: 'xs',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Item.Media, ($$anchor, Item_Media) => {
							Item_Media($$anchor, {
								variant: 'image',
								children: ($$anchor, $$slotProps) => {
									var img = root();

									$.set_attribute(img, 'width', 40);
									$.set_attribute(img, 'height', 40);
									$.append($$anchor, img);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Project Dashboard');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node, 2);

			$.component(node_4, () => Item.Root, ($$anchor, Item_Root_1) => {
				Item_Root_1($$anchor, {
					variant: 'outline',
					size: 'xs',
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_3();
						var node_5 = $.first_child(fragment_4);

						$.component(node_5, () => Item.Media, ($$anchor, Item_Media_1) => {
							Item_Media_1($$anchor, {
								variant: 'image',
								children: ($$anchor, $$slotProps) => {
									var img_1 = root_2();

									$.set_attribute(img_1, 'width', 40);
									$.set_attribute(img_1, 'height', 40);
									$.append($$anchor, img_1);
								},
								$$slots: { default: true }
							});
						});

						var node_6 = $.sibling(node_5, 2);

						$.component(node_6, () => Item.Content, ($$anchor, Item_Content_1) => {
							Item_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_7 = $.first_child(fragment_5);

									$.component(node_7, () => Item.Title, ($$anchor, Item_Title_1) => {
										Item_Title_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Document');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_6, 2);

						$.component(node_8, () => Item.Actions, ($$anchor, Item_Actions) => {
							Item_Actions($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										variant: 'outline',
										size: 'sm',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('View');

											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_9 = $.sibling(node_4, 2);

			$.component(node_9, () => Item.Root, ($$anchor, Item_Root_2) => {
				Item_Root_2($$anchor, {
					variant: 'outline',
					size: 'xs',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_3();
						var node_10 = $.first_child(fragment_7);

						$.component(node_10, () => Item.Media, ($$anchor, Item_Media_2) => {
							Item_Media_2($$anchor, {
								variant: 'image',
								children: ($$anchor, $$slotProps) => {
									var img_2 = root_4();

									$.set_attribute(img_2, 'width', 40);
									$.set_attribute(img_2, 'height', 40);
									$.append($$anchor, img_2);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => Item.Content, ($$anchor, Item_Content_2) => {
							Item_Content_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_12 = $.first_child(fragment_8);

									$.component(node_12, () => Item.Title, ($$anchor, Item_Title_2) => {
										Item_Title_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('File Attachment');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						var node_13 = $.sibling(node_11, 2);

						$.component(node_13, () => Item.Actions, ($$anchor, Item_Actions_1) => {
							Item_Actions_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										size: 'sm',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Download');

											$.append($$anchor, text_4);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}