import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Otp_form($$renderer, $$props) {
	let { $$slots, $$events, ...restProps } = $$props;

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, $.spread_props([
			restProps,
			{
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							class: 'text-center',
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										class: 'text-xl',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Enter verification code`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->We sent a 6-digit code to your email.`);
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

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<form>`);

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
																for: 'otp',
																class: 'sr-only',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Verification code`);
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
																		class: 'gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border',
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
																	maxlength: 6,
																	id: 'otp',
																	required: true,
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
																class: 'text-center',
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

											Button($$renderer, {
												type: 'submit',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Verify`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											if (Field.Description) {
												$$renderer.push('<!--[-->');

												Field.Description($$renderer, {
													class: 'text-center',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Didn't receive the code? <a href="#/">Resend</a>`);
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

								$$renderer.push(`</form>`);
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
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}