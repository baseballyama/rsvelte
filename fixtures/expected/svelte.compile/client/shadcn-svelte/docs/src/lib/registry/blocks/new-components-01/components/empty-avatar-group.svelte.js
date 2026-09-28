import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlusIcon from "@lucide/svelte/icons/plus";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex -space-x-2 *:size-12 *:ring-2 *:ring-background *:grayscale"><!> <!> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> Invite Members`, 1);

export default function Empty_avatar_group($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Empty.Root, ($$anchor, Empty_Root) => {
		Empty_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Empty.Header, ($$anchor, Empty_Header) => {
					Empty_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Media, ($$anchor, Empty_Media) => {
								Empty_Media($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var div = root_1();
										var node_3 = $.child(div);

										$.component(node_3, () => Avatar.Root, ($$anchor, Avatar_Root) => {
											Avatar_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();
													var node_4 = $.first_child(fragment_3);

													$.component(node_4, () => Avatar.Image, ($$anchor, Avatar_Image) => {
														Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
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

										var node_6 = $.sibling(node_3, 2);

										$.component(node_6, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
											Avatar_Root_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
														Avatar_Image_1($$anchor, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
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

										var node_9 = $.sibling(node_6, 2);

										$.component(node_9, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
											Avatar_Root_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_10 = $.first_child(fragment_5);

													$.component(node_10, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
														Avatar_Image_2($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
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

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_2, 2);

							$.component(node_12, () => Empty.Title, ($$anchor, Empty_Title) => {
								Empty_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('No Team Members');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_12, 2);

							$.component(node_13, () => Empty.Description, ($$anchor, Empty_Description) => {
								Empty_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Invite your team to collaborate on this project.');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_1, 2);

				$.component(node_14, () => Empty.Content, ($$anchor, Empty_Content) => {
					Empty_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_3();
									var node_15 = $.first_child(fragment_7);

									PlusIcon(node_15, {});
									$.next();
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
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