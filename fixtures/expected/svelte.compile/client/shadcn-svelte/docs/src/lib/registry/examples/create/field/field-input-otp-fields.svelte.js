import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { REGEXP_ONLY_DIGITS } from "bits-ui";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Field_input_otp_fields($$anchor) {
	let value = $.state("");
	let pinValue = $.state("");

	Example($$anchor, {
		title: 'OTP Input Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'otp-basic',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Verification Code');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let cells = () => ($$arg0?.()).cells;
											var fragment_4 = $.comment();
											var node_4 = $.first_child(fragment_4);

											$.component(node_4, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
												InputOTP_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_5 = $.comment();
														var node_5 = $.first_child(fragment_5);

														$.each(node_5, 16, cells, (cell) => cell, ($$anchor, cell) => {
															var fragment_6 = $.comment();
															var node_6 = $.first_child(fragment_6);

															$.component(node_6, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
																InputOTP_Slot($$anchor, {
																	get cell() {
																		return cell;
																	}
																});
															});

															$.append($$anchor, fragment_6);
														});

														$.append($$anchor, fragment_5);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_4);
										};

										$.component(node_3, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
											InputOTP_Root($$anchor, {
												id: 'otp-basic',
												maxlength: 6,
												children,
												$$slots: { default: true }
											});
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_7 = $.sibling(node_1, 2);

						$.component(node_7, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_8 = $.first_child(fragment_7);

									$.component(node_8, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'otp-with-desc',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Enter OTP');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_8, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let cells = () => ($$arg0?.()).cells;
											var fragment_8 = $.comment();
											var node_10 = $.first_child(fragment_8);

											$.component(node_10, () => InputOTP.Group, ($$anchor, InputOTP_Group_1) => {
												InputOTP_Group_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_11 = $.first_child(fragment_9);

														$.each(node_11, 16, cells, (cell) => cell, ($$anchor, cell) => {
															var fragment_10 = $.comment();
															var node_12 = $.first_child(fragment_10);

															$.component(node_12, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_1) => {
																InputOTP_Slot_1($$anchor, {
																	get cell() {
																		return cell;
																	}
																});
															});

															$.append($$anchor, fragment_10);
														});

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_8);
										};

										$.component(node_9, () => InputOTP.Root, ($$anchor, InputOTP_Root_1) => {
											InputOTP_Root_1($$anchor, {
												id: 'otp-with-desc',
												maxlength: 6,
												get value() {
													return $.get(value);
												},

												set value($$value) {
													$.set(value, $$value, true);
												},
												children,
												$$slots: { default: true }
											});
										});
									}

									var node_13 = $.sibling(node_9, 2);

									$.component(node_13, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text('Enter the 6-digit code sent to your email.');

												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_7, 2);

						$.component(node_14, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_1();
									var node_15 = $.first_child(fragment_11);

									$.component(node_15, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'otp-separator',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Two-Factor Authentication');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_15, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let cells = () => ($$arg0?.()).cells;
											var fragment_12 = root_1();
											var node_17 = $.first_child(fragment_12);

											$.component(node_17, () => InputOTP.Group, ($$anchor, InputOTP_Group_2) => {
												InputOTP_Group_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_13 = $.comment();
														var node_18 = $.first_child(fragment_13);

														$.each(node_18, 16, () => cells().slice(0, 3), (cell) => cell, ($$anchor, cell) => {
															var fragment_14 = $.comment();
															var node_19 = $.first_child(fragment_14);

															$.component(node_19, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_2) => {
																InputOTP_Slot_2($$anchor, {
																	get cell() {
																		return cell;
																	}
																});
															});

															$.append($$anchor, fragment_14);
														});

														$.append($$anchor, fragment_13);
													},
													$$slots: { default: true }
												});
											});

											var node_20 = $.sibling(node_17, 2);

											$.component(node_20, () => InputOTP.Separator, ($$anchor, InputOTP_Separator) => {
												InputOTP_Separator($$anchor, {});
											});

											var node_21 = $.sibling(node_20, 2);

											$.component(node_21, () => InputOTP.Group, ($$anchor, InputOTP_Group_3) => {
												InputOTP_Group_3($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_15 = $.comment();
														var node_22 = $.first_child(fragment_15);

														$.each(node_22, 16, () => cells().slice(3, 6), (cell) => cell, ($$anchor, cell) => {
															var fragment_16 = $.comment();
															var node_23 = $.first_child(fragment_16);

															$.component(node_23, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_3) => {
																InputOTP_Slot_3($$anchor, {
																	get cell() {
																		return cell;
																	}
																});
															});

															$.append($$anchor, fragment_16);
														});

														$.append($$anchor, fragment_15);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_12);
										};

										$.component(node_16, () => InputOTP.Root, ($$anchor, InputOTP_Root_2) => {
											InputOTP_Root_2($$anchor, {
												id: 'otp-separator',
												maxlength: 6,
												children,
												$$slots: { default: true }
											});
										});
									}

									var node_24 = $.sibling(node_16, 2);

									$.component(node_24, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Enter the code from your authenticator app.');

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

						var node_25 = $.sibling(node_14, 2);

						$.component(node_25, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_1();
									var node_26 = $.first_child(fragment_17);

									$.component(node_26, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'otp-pin',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('PIN Code');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_27 = $.sibling(node_26, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let cells = () => ($$arg0?.()).cells;
											var fragment_18 = $.comment();
											var node_28 = $.first_child(fragment_18);

											$.component(node_28, () => InputOTP.Group, ($$anchor, InputOTP_Group_4) => {
												InputOTP_Group_4($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_19 = $.comment();
														var node_29 = $.first_child(fragment_19);

														$.each(node_29, 16, cells, (cell) => cell, ($$anchor, cell) => {
															var fragment_20 = $.comment();
															var node_30 = $.first_child(fragment_20);

															$.component(node_30, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_4) => {
																InputOTP_Slot_4($$anchor, {
																	get cell() {
																		return cell;
																	}
																});
															});

															$.append($$anchor, fragment_20);
														});

														$.append($$anchor, fragment_19);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_18);
										};

										$.component(node_27, () => InputOTP.Root, ($$anchor, InputOTP_Root_3) => {
											InputOTP_Root_3($$anchor, {
												id: 'otp-pin',
												maxlength: 4,
												get pattern() {
													return REGEXP_ONLY_DIGITS;
												},

												get value() {
													return $.get(pinValue);
												},

												set value($$value) {
													$.set(pinValue, $$value, true);
												},
												children,
												$$slots: { default: true }
											});
										});
									}

									var node_31 = $.sibling(node_27, 2);

									$.component(node_31, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text('Enter your 4-digit PIN (numbers only).');

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						var node_32 = $.sibling(node_25, 2);

						$.component(node_32, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								'data-invalid': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_21 = root_1();
									var node_33 = $.first_child(fragment_21);

									$.component(node_33, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'otp-invalid',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Invalid OTP');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_34 = $.sibling(node_33, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let cells = () => ($$arg0?.()).cells;
											var fragment_22 = $.comment();
											var node_35 = $.first_child(fragment_22);

											$.component(node_35, () => InputOTP.Group, ($$anchor, InputOTP_Group_5) => {
												InputOTP_Group_5($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_23 = $.comment();
														var node_36 = $.first_child(fragment_23);

														$.each(node_36, 16, cells, (cell) => cell, ($$anchor, cell) => {
															var fragment_24 = $.comment();
															var node_37 = $.first_child(fragment_24);

															$.component(node_37, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_5) => {
																InputOTP_Slot_5($$anchor, {
																	get cell() {
																		return cell;
																	},
																	'aria-invalid': true
																});
															});

															$.append($$anchor, fragment_24);
														});

														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_22);
										};

										$.component(node_34, () => InputOTP.Root, ($$anchor, InputOTP_Root_4) => {
											InputOTP_Root_4($$anchor, {
												id: 'otp-invalid',
												maxlength: 6,
												children,
												$$slots: { default: true }
											});
										});
									}

									var node_38 = $.sibling(node_34, 2);

									$.component(node_38, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('This OTP field contains validation errors.');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_21);
								},
								$$slots: { default: true }
							});
						});

						var node_39 = $.sibling(node_32, 2);

						$.component(node_39, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								'data-disabled': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_25 = root_1();
									var node_40 = $.first_child(fragment_25);

									$.component(node_40, () => Field.Label, ($$anchor, Field_Label_5) => {
										Field_Label_5($$anchor, {
											for: 'otp-disabled-field',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Disabled OTP');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_41 = $.sibling(node_40, 2);

									{
										const children = ($$anchor, $$arg0) => {
											let cells = () => ($$arg0?.()).cells;
											var fragment_26 = $.comment();
											var node_42 = $.first_child(fragment_26);

											$.component(node_42, () => InputOTP.Group, ($$anchor, InputOTP_Group_6) => {
												InputOTP_Group_6($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_27 = $.comment();
														var node_43 = $.first_child(fragment_27);

														$.each(node_43, 16, cells, (cell) => cell, ($$anchor, cell) => {
															var fragment_28 = $.comment();
															var node_44 = $.first_child(fragment_28);

															$.component(node_44, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_6) => {
																InputOTP_Slot_6($$anchor, {
																	get cell() {
																		return cell;
																	}
																});
															});

															$.append($$anchor, fragment_28);
														});

														$.append($$anchor, fragment_27);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_26);
										};

										$.component(node_41, () => InputOTP.Root, ($$anchor, InputOTP_Root_5) => {
											InputOTP_Root_5($$anchor, {
												id: 'otp-disabled-field',
												maxlength: 6,
												disabled: true,
												children,
												$$slots: { default: true }
											});
										});
									}

									var node_45 = $.sibling(node_41, 2);

									$.component(node_45, () => Field.Description, ($$anchor, Field_Description_4) => {
										Field_Description_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('This OTP field is currently disabled.');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_25);
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