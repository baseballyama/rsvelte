import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Empty from "$lib/registry/ui/empty/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Empty_avatar_demo($$anchor) {
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
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Empty.Media, ($$anchor, Empty_Media) => {
								Empty_Media($$anchor, {
									variant: 'default',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Avatar.Root, ($$anchor, Avatar_Root) => {
											Avatar_Root($$anchor, {
												class: 'size-12',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_4 = $.first_child(fragment_4);

													$.component(node_4, () => Avatar.Image, ($$anchor, Avatar_Image) => {
														Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', class: 'grayscale' });
													});

													var node_5 = $.sibling(node_4, 2);

													$.component(node_5, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
														Avatar_Fallback($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('LR');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_2, 2);

							$.component(node_6, () => Empty.Title, ($$anchor, Empty_Title) => {
								Empty_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('User Offline');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Empty.Description, ($$anchor, Empty_Description) => {
								Empty_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('This user is currently offline. You can leave a message to notify them or try again later.');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => Empty.Content, ($$anchor, Empty_Content) => {
					Empty_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Leave Message');

									$.append($$anchor, text_3);
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