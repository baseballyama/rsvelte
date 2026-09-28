import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Plus from "@lucide/svelte/icons/plus";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale"><!> <!> <!></div>`);
var root_3 = $.from_html(`<div class="flex w-full max-w-lg flex-col gap-6"><!> <!></div>`);

export default function Item_avatar($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Item.Root, ($$anchor, Item_Root) => {
		Item_Root($$anchor, {
			variant: 'outline',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Item.Media, ($$anchor, Item_Media) => {
					Item_Media($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Avatar.Root, ($$anchor, Avatar_Root) => {
								Avatar_Root($$anchor, {
									class: 'size-10',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Avatar.Image, ($$anchor, Avatar_Image) => {
											Avatar_Image($$anchor, { src: 'https://github.com/evilrabbit.png' });
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
											Avatar_Fallback($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('ER');

													$.append($$anchor, text);
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
				});

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Item.Content, ($$anchor, Item_Content) => {
					Item_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_6 = $.first_child(fragment_3);

							$.component(node_6, () => Item.Title, ($$anchor, Item_Title) => {
								Item_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Evil Rabbit');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Item.Description, ($$anchor, Item_Description) => {
								Item_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Last seen 5 months ago');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_5, 2);

				$.component(node_8, () => Item.Actions, ($$anchor, Item_Actions) => {
					Item_Actions($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								size: 'icon',
								variant: 'outline',
								class: 'rounded-full',
								'aria-label': 'Invite',
								children: ($$anchor, $$slotProps) => {
									Plus($$anchor, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_9 = $.sibling(node, 2);

	$.component(node_9, () => Item.Root, ($$anchor, Item_Root_1) => {
		Item_Root_1($$anchor, {
			variant: 'outline',
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_1();
				var node_10 = $.first_child(fragment_6);

				$.component(node_10, () => Item.Media, ($$anchor, Item_Media_1) => {
					Item_Media_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_2();
							var node_11 = $.child(div_1);

							$.component(node_11, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
								Avatar_Root_1($$anchor, {
									class: 'hidden sm:flex',
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root();
										var node_12 = $.first_child(fragment_7);

										$.component(node_12, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
											Avatar_Image_1($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
											Avatar_Fallback_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('CN');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_11, 2);

							$.component(node_14, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
								Avatar_Root_2($$anchor, {
									class: 'hidden sm:flex',
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_15 = $.first_child(fragment_8);

										$.component(node_15, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
											Avatar_Image_2($$anchor, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
											Avatar_Fallback_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('LR');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							var node_17 = $.sibling(node_14, 2);

							$.component(node_17, () => Avatar.Root, ($$anchor, Avatar_Root_3) => {
								Avatar_Root_3($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_9 = root();
										var node_18 = $.first_child(fragment_9);

										$.component(node_18, () => Avatar.Image, ($$anchor, Avatar_Image_3) => {
											Avatar_Image_3($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
										});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_3) => {
											Avatar_Fallback_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('ER');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_9);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				var node_20 = $.sibling(node_10, 2);

				$.component(node_20, () => Item.Content, ($$anchor, Item_Content_1) => {
					Item_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_10 = root();
							var node_21 = $.first_child(fragment_10);

							$.component(node_21, () => Item.Title, ($$anchor, Item_Title_1) => {
								Item_Title_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('No Team Members');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							var node_22 = $.sibling(node_21, 2);

							$.component(node_22, () => Item.Description, ($$anchor, Item_Description_1) => {
								Item_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('Invite your team to collaborate on this project.');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});
				});

				var node_23 = $.sibling(node_20, 2);

				$.component(node_23, () => Item.Actions, ($$anchor, Item_Actions_1) => {
					Item_Actions_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								size: 'sm',
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('Invite');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}