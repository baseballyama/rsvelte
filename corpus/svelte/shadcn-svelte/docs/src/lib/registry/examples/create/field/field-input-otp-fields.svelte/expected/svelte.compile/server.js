import * as $ from 'svelte/internal/server';
import { REGEXP_ONLY_DIGITS } from "bits-ui";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Field_input_otp_fields($$renderer) {
	let value = "";
	let pinValue = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'OTP Input Fields',
			children: ($$renderer) => {
				if (Field.Group) {
					$$renderer.push('<!--[-->');

					Field.Group($$renderer, {
						children: ($$renderer) => {
							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'otp-basic',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Verification Code`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										{
											function children($$renderer, { cells }) {
												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(cells);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let cell = each_array[$$index];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (InputOTP.Root) {
												$$renderer.push('<!--[-->');

												InputOTP.Root($$renderer, {
													id: 'otp-basic',
													maxlength: 6,
													children,
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'otp-with-desc',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Enter OTP`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										{
											function children($$renderer, { cells }) {
												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_1 = $.ensure_array_like(cells);

															for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																let cell = each_array_1[$$index_1];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (InputOTP.Root) {
												$$renderer.push('<!--[-->');

												InputOTP.Root($$renderer, {
													id: 'otp-with-desc',
													maxlength: 6,
													get value() {
														return value;
													},

													set value($$value) {
														value = $$value;
														$$settled = false;
													},
													children,
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Field.Description) {
											$$renderer.push('<!--[-->');

											Field.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Enter the 6-digit code sent to your email.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'otp-separator',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Two-Factor Authentication`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										{
											function children($$renderer, { cells }) {
												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_2 = $.ensure_array_like(cells.slice(0, 3));

															for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																let cell = each_array_2[$$index_2];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputOTP.Separator) {
													$$renderer.push('<!--[-->');
													InputOTP.Separator($$renderer, {});
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_3 = $.ensure_array_like(cells.slice(3, 6));

															for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																let cell = each_array_3[$$index_3];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (InputOTP.Root) {
												$$renderer.push('<!--[-->');

												InputOTP.Root($$renderer, {
													id: 'otp-separator',
													maxlength: 6,
													children,
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Field.Description) {
											$$renderer.push('<!--[-->');

											Field.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Enter the code from your authenticator app.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'otp-pin',
												children: ($$renderer) => {
													$$renderer.push(`<!---->PIN Code`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										{
											function children($$renderer, { cells }) {
												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_4 = $.ensure_array_like(cells);

															for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																let cell = each_array_4[$$index_4];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (InputOTP.Root) {
												$$renderer.push('<!--[-->');

												InputOTP.Root($$renderer, {
													id: 'otp-pin',
													maxlength: 4,
													pattern: REGEXP_ONLY_DIGITS,
													get value() {
														return pinValue;
													},

													set value($$value) {
														pinValue = $$value;
														$$settled = false;
													},
													children,
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Field.Description) {
											$$renderer.push('<!--[-->');

											Field.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Enter your 4-digit PIN (numbers only).`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									'data-invalid': true,
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'otp-invalid',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Invalid OTP`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										{
											function children($$renderer, { cells }) {
												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_5 = $.ensure_array_like(cells);

															for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
																let cell = each_array_5[$$index_5];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell, 'aria-invalid': true });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (InputOTP.Root) {
												$$renderer.push('<!--[-->');

												InputOTP.Root($$renderer, {
													id: 'otp-invalid',
													maxlength: 6,
													children,
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Field.Description) {
											$$renderer.push('<!--[-->');

											Field.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->This OTP field contains validation errors.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Field.Field) {
								$$renderer.push('<!--[-->');

								Field.Field($$renderer, {
									'data-disabled': true,
									children: ($$renderer) => {
										if (Field.Label) {
											$$renderer.push('<!--[-->');

											Field.Label($$renderer, {
												for: 'otp-disabled-field',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Disabled OTP`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										{
											function children($$renderer, { cells }) {
												if (InputOTP.Group) {
													$$renderer.push('<!--[-->');

													InputOTP.Group($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array_6 = $.ensure_array_like(cells);

															for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
																let cell = each_array_6[$$index_6];

																if (InputOTP.Slot) {
																	$$renderer.push('<!--[-->');
																	InputOTP.Slot($$renderer, { cell });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(`<!--]-->`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											if (InputOTP.Root) {
												$$renderer.push('<!--[-->');

												InputOTP.Root($$renderer, {
													id: 'otp-disabled-field',
													maxlength: 6,
													disabled: true,
													children,
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(` `);

										if (Field.Description) {
											$$renderer.push('<!--[-->');

											Field.Description($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->This OTP field is currently disabled.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}