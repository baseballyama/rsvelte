import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Tabs from "$lib/registry/ui/tabs/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-3"><!> <!></div> <div class="grid gap-3"><!> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="-mb-4 flex w-full max-w-sm flex-col gap-6"><!></div>`);

export default function Tabs_demo($$anchor) {
	var div = root_3();
	var node = $.child(div);

	$.component(node, () => Tabs.Root, ($$anchor, Tabs_Root) => {
		Tabs_Root($$anchor, {
			value: 'account',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tabs.List, ($$anchor, Tabs_List) => {
					Tabs_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
								Tabs_Trigger($$anchor, {
									value: 'account',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Account');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
								Tabs_Trigger_1($$anchor, {
									value: 'password',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Password');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Tabs.Content, ($$anchor, Tabs_Content) => {
					Tabs_Content($$anchor, {
						value: 'account',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => Card.Root, ($$anchor, Card_Root) => {
								Card_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_2();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Card.Header, ($$anchor, Card_Header) => {
											Card_Header($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Card.Title, ($$anchor, Card_Title) => {
														Card_Title($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Account');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => Card.Description, ($$anchor, Card_Description) => {
														Card_Description($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Make changes to your account here. Click save when you\'re done.');

																$.append($$anchor, text_3);
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

										$.component(node_9, () => Card.Content, ($$anchor, Card_Content) => {
											Card_Content($$anchor, {
												class: 'grid gap-6',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root_1();
													var div_1 = $.first_child(fragment_5);
													var node_10 = $.child(div_1);

													Label(node_10, {
														for: 'tabs-demo-name',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Name');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});

													var node_11 = $.sibling(node_10, 2);

													Input(node_11, { id: 'tabs-demo-name', value: 'Pedro Duarte' });
													$.reset(div_1);

													var div_2 = $.sibling(div_1, 2);
													var node_12 = $.child(div_2);

													Label(node_12, {
														for: 'tabs-demo-username',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Username');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});

													var node_13 = $.sibling(node_12, 2);

													Input(node_13, { id: 'tabs-demo-username', value: '@peduarte' });
													$.reset(div_2);
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_9, 2);

										$.component(node_14, () => Card.Footer, ($$anchor, Card_Footer) => {
											Card_Footer($$anchor, {
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Save changes');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
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

				var node_15 = $.sibling(node_4, 2);

				$.component(node_15, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
					Tabs_Content_1($$anchor, {
						value: 'password',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_16 = $.first_child(fragment_7);

							$.component(node_16, () => Card.Root, ($$anchor, Card_Root_1) => {
								Card_Root_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_2();
										var node_17 = $.first_child(fragment_8);

										$.component(node_17, () => Card.Header, ($$anchor, Card_Header_1) => {
											Card_Header_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root();
													var node_18 = $.first_child(fragment_9);

													$.component(node_18, () => Card.Title, ($$anchor, Card_Title_1) => {
														Card_Title_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_7 = $.text('Password');

																$.append($$anchor, text_7);
															},
															$$slots: { default: true }
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => Card.Description, ($$anchor, Card_Description_1) => {
														Card_Description_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_8 = $.text('Change your password here. After saving, you\'ll be logged out.');

																$.append($$anchor, text_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										var node_20 = $.sibling(node_17, 2);

										$.component(node_20, () => Card.Content, ($$anchor, Card_Content_1) => {
											Card_Content_1($$anchor, {
												class: 'grid gap-6',
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_1();
													var div_3 = $.first_child(fragment_10);
													var node_21 = $.child(div_3);

													Label(node_21, {
														for: 'tabs-demo-current',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Current password');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});

													var node_22 = $.sibling(node_21, 2);

													Input(node_22, { id: 'tabs-demo-current', type: 'password' });
													$.reset(div_3);

													var div_4 = $.sibling(div_3, 2);
													var node_23 = $.child(div_4);

													Label(node_23, {
														for: 'tabs-demo-new',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('New password');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});

													var node_24 = $.sibling(node_23, 2);

													Input(node_24, { id: 'tabs-demo-new', type: 'password' });
													$.reset(div_4);
													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										var node_25 = $.sibling(node_20, 2);

										$.component(node_25, () => Card.Footer, ($$anchor, Card_Footer_1) => {
											Card_Footer_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													Button($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Save password');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
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

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}