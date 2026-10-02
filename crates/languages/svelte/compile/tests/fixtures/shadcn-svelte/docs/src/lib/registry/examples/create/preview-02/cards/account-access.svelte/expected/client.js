import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between"><!> <a href="#/" class="text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground">Forgot?</a></div> <!>`, 1);
var root_2 = $.from_html(`<!> Update Security`, 1);
var root_3 = $.from_html(`<a><!> <!> <!></a>`);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function Account_access($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Account Access');

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

										var text_1 = $.text('Update your credentials or re-authenticate.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'email-address',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Email Address');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													Input(node_8, {
														id: 'email-address',
														type: 'email',
														value: 'artist@studio.inc'
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_6, 2);

										$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_1();
													var div = $.first_child(fragment_6);
													var node_10 = $.child(div);

													$.component(node_10, () => Field.Label, ($$anchor, Field_Label_1) => {
														Field_Label_1($$anchor, {
															for: 'current-password',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Current Password');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													$.next(2);
													$.reset(div);

													var node_11 = $.sibling(div, 2);

													Input(node_11, {
														id: 'current-password',
														type: 'password',
														value: 'password123'
													});

													$.append($$anchor, fragment_6);
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

				var node_12 = $.sibling(node_4, 2);

				$.component(node_12, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_13 = $.first_child(fragment_7);

							Button(node_13, {
								class: 'w-full',
								children: ($$anchor, $$slotProps) => {
									var fragment_8 = root_2();
									var node_14 = $.first_child(fragment_8);

									IconPlaceholder(node_14, {
										lucide: 'LockKeyholeIcon',
										tabler: 'IconLock',
										hugeicons: 'SquareLock02Icon',
										phosphor: 'LockKeyIcon',
										remixicon: 'RiLockLine'
									});

									$.next();
									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_13, 2);

							{
								const child = ($$anchor, $$arg0) => {
									let props = () => ($$arg0?.()).props;
									var a = root_3();

									$.attribute_effect(a, () => ({ href: '#/', ...props() }));

									var node_16 = $.child(a);

									$.component(node_16, () => Item.Media, ($$anchor, Item_Media) => {
										Item_Media($$anchor, {
											variant: 'icon',
											children: ($$anchor, $$slotProps) => {
												IconPlaceholder($$anchor, {
													lucide: 'AlertCircleIcon',
													tabler: 'IconAlertCircle',
													hugeicons: 'AlertCircleIcon',
													phosphor: 'WarningCircleIcon',
													remixicon: 'RiErrorWarningLine',
													class: 'text-destructive'
												});
											},
											$$slots: { default: true }
										});
									});

									var node_17 = $.sibling(node_16, 2);

									$.component(node_17, () => Item.Content, ($$anchor, Item_Content) => {
										Item_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root();
												var node_18 = $.first_child(fragment_10);

												$.component(node_18, () => Item.Title, ($$anchor, Item_Title) => {
													Item_Title($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('Danger Zone');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												var node_19 = $.sibling(node_18, 2);

												$.component(node_19, () => Item.Description, ($$anchor, Item_Description) => {
													Item_Description($$anchor, {
														class: 'line-clamp-1',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Archive account and remove catalog');

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

									var node_20 = $.sibling(node_17, 2);

									IconPlaceholder(node_20, {
										lucide: 'ArrowRightIcon',
										tabler: 'IconArrowRight',
										hugeicons: 'ArrowRight01Icon',
										phosphor: 'ArrowRightIcon',
										remixicon: 'RiArrowRightLine',
										class: 'size-4'
									});

									$.reset(a);
									$.append($$anchor, a);
								};

								$.component(node_15, () => Item.Root, ($$anchor, Item_Root) => {
									Item_Root($$anchor, { variant: 'muted', child, $$slots: { child: true } });
								});
							}

							$.append($$anchor, fragment_7);
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