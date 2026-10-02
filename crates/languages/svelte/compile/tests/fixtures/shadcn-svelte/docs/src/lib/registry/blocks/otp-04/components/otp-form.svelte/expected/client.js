import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<h1 class="text-2xl font-bold">Enter verification code</h1> <p class="text-sm text-balance text-muted-foreground">We sent a 6-digit code to your email</p>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Didn't receive the code? <a href="#/">Resend</a>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<form class="flex flex-col items-center justify-center p-6 md:p-8"><!></form> <div class="relative hidden bg-muted md:block"><img src="/placeholder.svg" alt="" class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"/></div>`, 1);
var root_5 = $.from_html(`By clicking continue, you agree to our <a href="#/">Terms of Service</a> and <a href="#/">Privacy Policy</a>.`, 1);
var root_6 = $.from_html(`<div><!> <!></div>`);

export default function Otp_form($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_6();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => cn("flex flex-col gap-6 md:min-h-[450px]", $$props.class)
	]);

	var node = $.child(div);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: 'flex-1 overflow-hidden p-0',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'grid flex-1 p-0 md:grid-cols-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_4();
							var form = $.first_child(fragment_1);
							var node_2 = $.child(form);

							$.component(node_2, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_1();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												class: 'items-center text-center',
												children: ($$anchor, $$slotProps) => {
													var fragment_3 = root();

													$.next(2);
													$.append($$anchor, fragment_3);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_5 = $.first_child(fragment_4);

													$.component(node_5, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'otp',
															class: 'sr-only',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text('Verification code');

																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_6 = $.sibling(node_5, 2);

													{
														const children = ($$anchor, $$arg0) => {
															let cells = () => ($$arg0?.()).cells;
															var fragment_5 = root_1();
															var node_7 = $.first_child(fragment_5);

															$.component(node_7, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
																InputOTP_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = $.comment();
																		var node_8 = $.first_child(fragment_6);

																		$.each(node_8, 16, () => cells().slice(0, 3), (cell) => cell, ($$anchor, cell) => {
																			var fragment_7 = $.comment();
																			var node_9 = $.first_child(fragment_7);

																			$.component(node_9, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
																				InputOTP_Slot($$anchor, {
																					get cell() {
																						return cell;
																					}
																				});
																			});

																			$.append($$anchor, fragment_7);
																		});

																		$.append($$anchor, fragment_6);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_7, 2);

															$.component(node_10, () => InputOTP.Separator, ($$anchor, InputOTP_Separator) => {
																InputOTP_Separator($$anchor, {});
															});

															var node_11 = $.sibling(node_10, 2);

															$.component(node_11, () => InputOTP.Group, ($$anchor, InputOTP_Group_1) => {
																InputOTP_Group_1($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_8 = $.comment();
																		var node_12 = $.first_child(fragment_8);

																		$.each(node_12, 16, () => cells().slice(3, 6), (cell) => cell, ($$anchor, cell) => {
																			var fragment_9 = $.comment();
																			var node_13 = $.first_child(fragment_9);

																			$.component(node_13, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_1) => {
																				InputOTP_Slot_1($$anchor, {
																					get cell() {
																						return cell;
																					}
																				});
																			});

																			$.append($$anchor, fragment_9);
																		});

																		$.append($$anchor, fragment_8);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_5);
														};

														$.component(node_6, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
															InputOTP_Root($$anchor, {
																maxlength: 6,
																id: 'otp',
																required: true,
																class: 'gap-4',
																children,
																$$slots: { default: true }
															});
														});
													}

													var node_14 = $.sibling(node_6, 2);

													$.component(node_14, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															class: 'text-center',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_1 = $.text('Enter the 6-digit code sent to your email.');

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

										var node_15 = $.sibling(node_4, 2);

										$.component(node_15, () => Field.Field, ($$anchor, Field_Field_2) => {
											Field_Field_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = root_3();
													var node_16 = $.first_child(fragment_10);

													Button(node_16, {
														type: 'submit',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Verify');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});

													var node_17 = $.sibling(node_16, 2);

													$.component(node_17, () => Field.Description, ($$anchor, Field_Description_1) => {
														Field_Description_1($$anchor, {
															class: 'text-center',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_11 = root_2();

																$.next();
																$.append($$anchor, fragment_11);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							$.reset(form);
							$.next(2);
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_18 = $.sibling(node, 2);

	$.component(node_18, () => Field.Description, ($$anchor, Field_Description_2) => {
		Field_Description_2($$anchor, {
			class: 'text-center',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_12 = root_5();

				$.next(4);
				$.append($$anchor, fragment_12);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}