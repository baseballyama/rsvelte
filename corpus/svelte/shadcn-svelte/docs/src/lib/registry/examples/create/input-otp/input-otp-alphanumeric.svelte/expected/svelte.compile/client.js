import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Input_otp_alphanumeric($$anchor) {
	Example($$anchor, {
		title: 'Alphanumeric',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'alphanumeric',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Alphanumeric');

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

									var text_1 = $.text('Accepts both letters and numbers.');

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

											$.each(node_5, 16, () => cells().slice(0, 3), (cell) => cell, ($$anchor, cell) => {
												var fragment_5 = $.comment();
												var node_6 = $.first_child(fragment_5);

												$.component(node_6, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
													InputOTP_Slot($$anchor, {
														get cell() {
															return cell;
														}
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

											$.each(node_9, 16, () => cells().slice(3, 6), (cell) => cell, ($$anchor, cell) => {
												var fragment_7 = $.comment();
												var node_10 = $.first_child(fragment_7);

												$.component(node_10, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_1) => {
													InputOTP_Slot_1($$anchor, {
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

								$.append($$anchor, fragment_3);
							};

							$.component(node_3, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
								InputOTP_Root($$anchor, {
									id: 'alphanumeric',
									maxlength: 6,
									get pattern() {
										return REGEXP_ONLY_DIGITS_AND_CHARS;
									},
									children,
									$$slots: { default: true }
								});
							});
						}

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