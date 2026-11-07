import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Input_otp_invalid($$anchor) {
	let value = $.state("000000");

	Example($$anchor, {
		title: 'Invalid State',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'invalid',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Invalid State');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Field.Description, ($$anchor, Field_Description) => {
							Field_Description($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Example showing the invalid error state.');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						{
							const children = ($$anchor, $$arg0) => {
								let cells = () => ($$arg0?.()).cells;
								var fragment_3 = root();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
									InputOTP_Group($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.each(node_5, 16, () => cells().slice(0, 2), (cell) => cell, ($$anchor, cell) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
													InputOTP_Slot($$anchor, {
														get cell() {
															return cell;
														},
														'aria-invalid': true
													});
												});

												$.append($$anchor, fragment_5);
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_4, 2);

								$.component(node_7, () => InputOTP.Separator, ($$anchor, InputOTP_Separator) => {
									InputOTP_Separator($$anchor, {});
								});

								var node_8 = $.sibling(node_7, 2);

								$.component(node_8, () => InputOTP.Group, ($$anchor, InputOTP_Group_1) => {
									InputOTP_Group_1($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_9 = $.first_child(fragment_6);

											$.each(node_9, 16, () => cells().slice(2, 4), (cell) => cell, ($$anchor, cell) => {
												var fragment_7 = $.comment();
												var node_10 = $.first_child(fragment_7);

												$.component(node_10, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_1) => {
													InputOTP_Slot_1($$anchor, {
														get cell() {
															return cell;
														},
														'aria-invalid': true
													});
												});

												$.append($$anchor, fragment_7);
											});

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								var node_11 = $.sibling(node_8, 2);

								$.component(node_11, () => InputOTP.Separator, ($$anchor, InputOTP_Separator_1) => {
									InputOTP_Separator_1($$anchor, {});
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => InputOTP.Group, ($$anchor, InputOTP_Group_2) => {
									InputOTP_Group_2($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_13 = $.first_child(fragment_8);

											$.each(node_13, 16, () => cells().slice(4, 6), (cell) => cell, ($$anchor, cell) => {
												var fragment_9 = $.comment();
												var node_14 = $.first_child(fragment_9);

												$.component(node_14, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_2) => {
													InputOTP_Slot_2($$anchor, {
														get cell() {
															return cell;
														},
														'aria-invalid': true
													});
												});

												$.append($$anchor, fragment_9);
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							};

							$.component(node_3, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
								InputOTP_Root($$anchor, {
									id: 'invalid',
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

						var node_15 = $.sibling(node_3, 2);

						$.component(node_15, () => Field.Error, ($$anchor, Field_Error) => {
							Field_Error($$anchor, { errors: [{ message: "Invalid code. Please try again." }] });
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