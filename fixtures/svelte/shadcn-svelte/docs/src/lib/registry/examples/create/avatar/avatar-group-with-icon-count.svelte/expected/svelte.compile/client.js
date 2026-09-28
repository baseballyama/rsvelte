import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Avatar_group_with_icon_count($$anchor) {
	Example($$anchor, {
		title: 'Group with Icon Count',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Avatar.Group, ($$anchor, Avatar_Group) => {
				Avatar_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Avatar.Root, ($$anchor, Avatar_Root) => {
							Avatar_Root($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Avatar.Image, ($$anchor, Avatar_Image) => {
										Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
										Avatar_Fallback($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('CN');

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

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
							Avatar_Root_1($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
										Avatar_Image_1($$anchor, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
									});

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
										Avatar_Fallback_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('LR');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_4, 2);

						$.component(node_7, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
							Avatar_Root_2($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
										Avatar_Image_2($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
									});

									var node_9 = $.sibling(node_8, 2);

									$.component(node_9, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
										Avatar_Fallback_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('ER');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						var node_10 = $.sibling(node_7, 2);

						$.component(node_10, () => Avatar.GroupCount, ($$anchor, Avatar_GroupCount) => {
							Avatar_GroupCount($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'PlusSignIcon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine'
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

			var node_11 = $.sibling(node, 2);

			$.component(node_11, () => Avatar.Group, ($$anchor, Avatar_Group_1) => {
				Avatar_Group_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_12 = $.first_child(fragment_7);

						$.component(node_12, () => Avatar.Root, ($$anchor, Avatar_Root_3) => {
							Avatar_Root_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root();
									var node_13 = $.first_child(fragment_8);

									$.component(node_13, () => Avatar.Image, ($$anchor, Avatar_Image_3) => {
										Avatar_Image_3($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
									});

									var node_14 = $.sibling(node_13, 2);

									$.component(node_14, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_3) => {
										Avatar_Fallback_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('CN');

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

						var node_15 = $.sibling(node_12, 2);

						$.component(node_15, () => Avatar.Root, ($$anchor, Avatar_Root_4) => {
							Avatar_Root_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root();
									var node_16 = $.first_child(fragment_9);

									$.component(node_16, () => Avatar.Image, ($$anchor, Avatar_Image_4) => {
										Avatar_Image_4($$anchor, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
									});

									var node_17 = $.sibling(node_16, 2);

									$.component(node_17, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_4) => {
										Avatar_Fallback_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('LR');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_15, 2);

						$.component(node_18, () => Avatar.Root, ($$anchor, Avatar_Root_5) => {
							Avatar_Root_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_19 = $.first_child(fragment_10);

									$.component(node_19, () => Avatar.Image, ($$anchor, Avatar_Image_5) => {
										Avatar_Image_5($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
									});

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_5) => {
										Avatar_Fallback_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('ER');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_21 = $.sibling(node_18, 2);

						$.component(node_21, () => Avatar.GroupCount, ($$anchor, Avatar_GroupCount_1) => {
							Avatar_GroupCount_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'PlusSignIcon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine'
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

			var node_22 = $.sibling(node_11, 2);

			$.component(node_22, () => Avatar.Group, ($$anchor, Avatar_Group_2) => {
				Avatar_Group_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = root_1();
						var node_23 = $.first_child(fragment_12);

						$.component(node_23, () => Avatar.Root, ($$anchor, Avatar_Root_6) => {
							Avatar_Root_6($$anchor, {
								size: 'lg',
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root();
									var node_24 = $.first_child(fragment_13);

									$.component(node_24, () => Avatar.Image, ($$anchor, Avatar_Image_6) => {
										Avatar_Image_6($$anchor, {
											src: 'https://github.com/shadcn.png',
											alt: '@shadcn',
											class: 'grayscale'
										});
									});

									var node_25 = $.sibling(node_24, 2);

									$.component(node_25, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_6) => {
										Avatar_Fallback_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('CN');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						var node_26 = $.sibling(node_23, 2);

						$.component(node_26, () => Avatar.Root, ($$anchor, Avatar_Root_7) => {
							Avatar_Root_7($$anchor, {
								size: 'lg',
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root();
									var node_27 = $.first_child(fragment_14);

									$.component(node_27, () => Avatar.Image, ($$anchor, Avatar_Image_7) => {
										Avatar_Image_7($$anchor, {
											src: 'https://github.com/maxleiter.png',
											alt: '@maxleiter',
											class: 'grayscale'
										});
									});

									var node_28 = $.sibling(node_27, 2);

									$.component(node_28, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_7) => {
										Avatar_Fallback_7($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('LR');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_29 = $.sibling(node_26, 2);

						$.component(node_29, () => Avatar.Root, ($$anchor, Avatar_Root_8) => {
							Avatar_Root_8($$anchor, {
								size: 'lg',
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root();
									var node_30 = $.first_child(fragment_15);

									$.component(node_30, () => Avatar.Image, ($$anchor, Avatar_Image_8) => {
										Avatar_Image_8($$anchor, {
											src: 'https://github.com/evilrabbit.png',
											alt: '@evilrabbit',
											class: 'grayscale'
										});
									});

									var node_31 = $.sibling(node_30, 2);

									$.component(node_31, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_8) => {
										Avatar_Fallback_8($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('ER');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						var node_32 = $.sibling(node_29, 2);

						$.component(node_32, () => Avatar.GroupCount, ($$anchor, Avatar_GroupCount_2) => {
							Avatar_GroupCount_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									IconPlaceholder($$anchor, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'PlusSignIcon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine'
									});
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}