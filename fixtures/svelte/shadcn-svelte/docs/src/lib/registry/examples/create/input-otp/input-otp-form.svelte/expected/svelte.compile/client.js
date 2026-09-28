import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`Enter the verification code we sent to your email address: <span class="font-medium">m@example.com</span>.`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> Resend Code`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<a href="#/">I no longer have access to this email address.</a>`);
var root_5 = $.from_html(`<div class="flex items-center justify-between"><!> <!></div> <!> <!>`, 1);
var root_6 = $.from_html(`<form><!></form>`);
var root_7 = $.from_html(`<!> <div class="text-sm text-muted-foreground">Having trouble signing in? <a href="#/" class="underline underline-offset-4 transition-colors hover:text-primary">Contact support</a></div>`, 1);

export default function Input_otp_form($$anchor) {
	Example($$anchor, {
		title: 'Form',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
				Card_Root($$anchor, {
					class: 'mx-auto max-w-md',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
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

												var text = $.text('Verify your login');

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

												var fragment_4 = root();

												$.next(2);
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

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
							Card_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var form = root_6();
									var node_5 = $.child(form);

									$.component(node_5, () => Field.Field, ($$anchor, Field_Field) => {
										Field_Field($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_5();
												var div = $.first_child(fragment_5);
												var node_6 = $.child(div);

												$.component(node_6, () => Field.Label, ($$anchor, Field_Label) => {
													Field_Label($$anchor, {
														for: 'otp-verification',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Verification code');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_6, 2);

												$.component(node_7, () => Button.Root, ($$anchor, Button_Root) => {
													Button_Root($$anchor, {
														variant: 'outline',
														size: 'xs',
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root_2();
															var node_8 = $.first_child(fragment_6);

															IconPlaceholder(node_8, {
																lucide: 'RefreshCwIcon',
																hugeicons: 'RefreshIcon',
																tabler: 'IconRefresh',
																phosphor: 'ArrowClockwiseIcon',
																remixicon: 'RiRefreshLine',
																'data-icon': 'inline-start'
															});

															$.next();
															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												$.reset(div);

												var node_9 = $.sibling(div, 2);

												{
													const children = ($$anchor, $$arg0) => {
														let cells = () => ($$arg0?.()).cells;
														var fragment_7 = root_3();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
															InputOTP_Group($$anchor, {
																class: '*:data-[slot=input-otp-slot]:text-xl style-vega:*:data-[slot=input-otp-slot]:h-16 style-vega:*:data-[slot=input-otp-slot]:w-12 style-nova:*:data-[slot=input-otp-slot]:h-12 style-nova:*:data-[slot=input-otp-slot]:w-11 style-lyra:*:data-[slot=input-otp-slot]:h-12 style-lyra:*:data-[slot=input-otp-slot]:w-11 style-maia:*:data-[slot=input-otp-slot]:h-16 style-maia:*:data-[slot=input-otp-slot]:w-12 style-mira:*:data-[slot=input-otp-slot]:h-12 style-mira:*:data-[slot=input-otp-slot]:w-11',
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_11 = $.first_child(fragment_8);

																	$.each(node_11, 16, () => cells().slice(0, 3), (cell) => cell, ($$anchor, cell) => {
																		var fragment_9 = $.comment();
																		var node_12 = $.first_child(fragment_9);

																		$.component(node_12, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
																			InputOTP_Slot($$anchor, {
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

														var node_13 = $.sibling(node_10, 2);

														$.component(node_13, () => InputOTP.Separator, ($$anchor, InputOTP_Separator) => {
															InputOTP_Separator($$anchor, {});
														});

														var node_14 = $.sibling(node_13, 2);

														$.component(node_14, () => InputOTP.Group, ($$anchor, InputOTP_Group_1) => {
															InputOTP_Group_1($$anchor, {
																class: '*:data-[slot=input-otp-slot]:text-xl style-vega:*:data-[slot=input-otp-slot]:h-16 style-vega:*:data-[slot=input-otp-slot]:w-12 style-nova:*:data-[slot=input-otp-slot]:h-12 style-nova:*:data-[slot=input-otp-slot]:w-11 style-lyra:*:data-[slot=input-otp-slot]:h-12 style-lyra:*:data-[slot=input-otp-slot]:w-11 style-maia:*:data-[slot=input-otp-slot]:h-16 style-maia:*:data-[slot=input-otp-slot]:w-12 style-mira:*:data-[slot=input-otp-slot]:h-12 style-mira:*:data-[slot=input-otp-slot]:w-11',
																children: ($$anchor, $$slotProps) => {
																	var fragment_10 = $.comment();
																	var node_15 = $.first_child(fragment_10);

																	$.each(node_15, 16, () => cells().slice(3, 6), (cell) => cell, ($$anchor, cell) => {
																		var fragment_11 = $.comment();
																		var node_16 = $.first_child(fragment_11);

																		$.component(node_16, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_1) => {
																			InputOTP_Slot_1($$anchor, {
																				get cell() {
																					return cell;
																				}
																			});
																		});

																		$.append($$anchor, fragment_11);
																	});

																	$.append($$anchor, fragment_10);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													};

													$.component(node_9, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
														InputOTP_Root($$anchor, {
															maxlength: 6,
															id: 'otp-verification',
															required: true,
															children,
															$$slots: { default: true }
														});
													});
												}

												var node_17 = $.sibling(node_9, 2);

												$.component(node_17, () => Field.Description, ($$anchor, Field_Description) => {
													Field_Description($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var a = root_4();

															$.append($$anchor, a);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.reset(form);
									$.append($$anchor, form);
								},
								$$slots: { default: true }
							});
						});

						var node_18 = $.sibling(node_4, 2);

						$.component(node_18, () => Card.Footer, ($$anchor, Card_Footer) => {
							Card_Footer($$anchor, {
								class: 'flex-col gap-2',
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_7();
									var node_19 = $.first_child(fragment_12);

									$.component(node_19, () => Button.Root, ($$anchor, Button_Root_1) => {
										Button_Root_1($$anchor, {
											type: 'submit',
											class: 'w-full',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Verify');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.next(2);
									$.append($$anchor, fragment_12);
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