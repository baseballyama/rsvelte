import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Transcribe`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<p>Client requested dashboard redesign with focus on mobile responsiveness.</p> <ol class="mt-4 flex list-decimal flex-col gap-2 pl-6"><li>New analytics widgets for daily/weekly metrics</li> <li>Simplified navigation menu</li> <li>Dark mode support</li> <li>Timeline: 6 weeks</li> <li>Follow-up meeting scheduled for next Tuesday</li></ol>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Card_meeting_notes($$anchor) {
	Example($$anchor, {
		title: 'Meeting Notes',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto w-full max-w-sm',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
							Card_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
										Card_Title($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Meeting Notes');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
										Card_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Transcript from the meeting with the client.');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
										Card_Action($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												$.component(node_5, () => Button.Root, ($$anchor, Button_Root) => {
													Button_Root($$anchor, {
														variant: 'outline',
														size: 'sm',
														children: ($$anchor, $$slotProps) => {
															var fragment_5 = root();
															var node_6 = $.first_child(fragment_5);

															IconPlaceholder(node_6, {
																lucide: 'CaptionsIcon',
																tabler: 'IconTextCaption',
																hugeicons: 'TextCheckIcon',
																phosphor: 'TextTIcon',
																remixicon: 'RiClosedCaptioningLine'
															});

															$.next();
															$.append($$anchor, fragment_5);
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

						var node_7 = $.sibling(node_1, 2);

						$.component(node_7, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();

									$.next(2);
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_9 = $.first_child(fragment_7);

									$.component(node_9, () => Avatar.Group, ($$anchor, Avatar_Group) => {
										Avatar_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_4();
												var node_10 = $.first_child(fragment_8);

												$.component(node_10, () => Avatar.Root, ($$anchor, Avatar_Root) => {
													Avatar_Root($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_9 = root_3();
															var node_11 = $.first_child(fragment_9);

															$.component(node_11, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																Avatar_Image($$anchor, { src: 'https://github.com/shadcn.png', alt: '@shadcn' });
															});

															var node_12 = $.sibling(node_11, 2);

															$.component(node_12, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																Avatar_Fallback($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('CN');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_9);
														},
														$$slots: { default: true }
													});
												});

												var node_13 = $.sibling(node_10, 2);

												$.component(node_13, () => Avatar.Root, ($$anchor, Avatar_Root_1) => {
													Avatar_Root_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_3();
															var node_14 = $.first_child(fragment_10);

															$.component(node_14, () => Avatar.Image, ($$anchor, Avatar_Image_1) => {
																Avatar_Image_1($$anchor, { src: 'https://github.com/maxleiter.png', alt: '@maxleiter' });
															});

															var node_15 = $.sibling(node_14, 2);

															$.component(node_15, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_1) => {
																Avatar_Fallback_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text('LR');

																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												var node_16 = $.sibling(node_13, 2);

												$.component(node_16, () => Avatar.Root, ($$anchor, Avatar_Root_2) => {
													Avatar_Root_2($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_11 = root_3();
															var node_17 = $.first_child(fragment_11);

															$.component(node_17, () => Avatar.Image, ($$anchor, Avatar_Image_2) => {
																Avatar_Image_2($$anchor, { src: 'https://github.com/evilrabbit.png', alt: '@evilrabbit' });
															});

															var node_18 = $.sibling(node_17, 2);

															$.component(node_18, () => Avatar.Fallback, ($$anchor, Avatar_Fallback_2) => {
																Avatar_Fallback_2($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('ER');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_11);
														},
														$$slots: { default: true }
													});
												});

												var node_19 = $.sibling(node_16, 2);

												$.component(node_19, () => Avatar.GroupCount, ($$anchor, Avatar_GroupCount) => {
													Avatar_GroupCount($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('+8');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
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