import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Didn't receive the code? <a href="#/">Resend</a>`, 1);
var root_3 = $.from_html(`<form><!></form>`);

export default function Otp_form($$anchor, $$props) {
	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, $.spread_props(() => restProps, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'text-center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-xl',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Enter verification code');

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

										var text_1 = $.text('We sent a 6-digit code to your email.');

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
							var form = root_3();
							var node_5 = $.child(form);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_6 = $.first_child(fragment_3);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_7 = $.first_child(fragment_4);

													$.component(node_7, () => Field.Label, ($$anchor, Field_Label) => {
														Field_Label($$anchor, {
															for: 'otp',
															class: 'sr-only',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text('Verification code');

																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_8 = $.sibling(node_7, 2);

													{
														const children = ($$anchor, $$arg0) => {
															let cells = () => ($$arg0?.()).cells;
															var fragment_5 = $.comment();
															var node_9 = $.first_child(fragment_5);

															$.component(node_9, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
																InputOTP_Group($$anchor, {
																	class: 'gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_6 = $.comment();
																		var node_10 = $.first_child(fragment_6);

																		$.each(node_10, 16, cells, (cell) => cell, ($$anchor, cell) => {
																			var fragment_7 = $.comment();
																			var node_11 = $.first_child(fragment_7);

																			$.component(node_11, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
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

															$.append($$anchor, fragment_5);
														};

														$.component(node_8, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
															InputOTP_Root($$anchor, {
																maxlength: 6,
																id: 'otp',
																required: true,
																children,
																$$slots: { default: true }
															});
														});
													}

													var node_12 = $.sibling(node_8, 2);

													$.component(node_12, () => Field.Description, ($$anchor, Field_Description) => {
														Field_Description($$anchor, {
															class: 'text-center',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Enter the 6-digit code sent to your email.');

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

										var node_13 = $.sibling(node_6, 2);

										Button(node_13, {
											type: 'submit',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Verify');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => Field.Description, ($$anchor, Field_Description_1) => {
											Field_Description_1($$anchor, {
												class: 'text-center',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_8 = root_2();

													$.next();
													$.append($$anchor, fragment_8);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
}