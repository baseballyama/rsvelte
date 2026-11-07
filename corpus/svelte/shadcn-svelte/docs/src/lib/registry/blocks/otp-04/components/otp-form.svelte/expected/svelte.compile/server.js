import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Otp_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("flex flex-col gap-6 md:min-h-[450px]", className)),
			...restProps
		})}>`);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: 'flex-1 overflow-hidden p-0',
				children: ($$renderer) => {
					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'grid flex-1 p-0 md:grid-cols-2',
							children: ($$renderer) => {
								$$renderer.push(`<form class="flex flex-col items-center justify-center p-6 md:p-8">`);

								if (Field.Group) {
									$$renderer.push('<!--[-->');

									Field.Group($$renderer, {
										children: ($$renderer) => {
											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													class: 'items-center text-center',
													children: ($$renderer) => {
														$$renderer.push(`<h1 class="text-2xl font-bold">Enter verification code</h1> <p class="text-sm text-balance text-muted-foreground">We sent a 6-digit code to your email</p>`);
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
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array = $.ensure_array_like(cells.slice(0, 3));

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

																			const each_array_1 = $.ensure_array_like(cells.slice(3, 6));

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
																	maxlength: 6,
																	id: 'otp',
																	required: true,
																	class: 'gap-4',
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

											if (Field.Field) {
												$$renderer.push('<!--[-->');

												Field.Field($$renderer, {
													children: ($$renderer) => {
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
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</form> <div class="relative hidden bg-muted md:block"><img src="/placeholder.svg" alt="" class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"/></div>`);
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

		if (Field.Description) {
			$$renderer.push('<!--[-->');

			Field.Description($$renderer, {
				class: 'text-center',
				children: ($$renderer) => {
					$$renderer.push(`<!---->By clicking continue, you agree to our <a href="#/">Terms of Service</a> and <a href="#/">Privacy Policy</a>.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}