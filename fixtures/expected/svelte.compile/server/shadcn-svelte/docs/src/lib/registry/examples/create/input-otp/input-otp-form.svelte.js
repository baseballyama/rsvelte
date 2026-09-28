import * as $ from 'svelte/internal/server';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Input_otp_form($$renderer) {
	Example($$renderer, {
		title: 'Form',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'mx-auto max-w-md',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Verify your login`);
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
												$$renderer.push(`<!---->Enter the verification code we sent to your email address: <span class="font-medium">m@example.com</span>.`);
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

									if (Field.Field) {
										$$renderer.push('<!--[-->');

										Field.Field($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex items-center justify-between">`);

												if (Field.Label) {
													$$renderer.push('<!--[-->');

													Field.Label($$renderer, {
														for: 'otp-verification',
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

												if (Button.Root) {
													$$renderer.push('<!--[-->');

													Button.Root($$renderer, {
														variant: 'outline',
														size: 'xs',
														children: ($$renderer) => {
															IconPlaceholder($$renderer, {
																lucide: 'RefreshCwIcon',
																hugeicons: 'RefreshIcon',
																tabler: 'IconRefresh',
																phosphor: 'ArrowClockwiseIcon',
																remixicon: 'RiRefreshLine',
																'data-icon': 'inline-start'
															});

															$$renderer.push(`<!----> Resend Code`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(`</div> `);

												{
													function children($$renderer, { cells }) {
														if (InputOTP.Group) {
															$$renderer.push('<!--[-->');

															InputOTP.Group($$renderer, {
																class: '*:data-[slot=input-otp-slot]:text-xl style-vega:*:data-[slot=input-otp-slot]:h-16 style-vega:*:data-[slot=input-otp-slot]:w-12 style-nova:*:data-[slot=input-otp-slot]:h-12 style-nova:*:data-[slot=input-otp-slot]:w-11 style-lyra:*:data-[slot=input-otp-slot]:h-12 style-lyra:*:data-[slot=input-otp-slot]:w-11 style-maia:*:data-[slot=input-otp-slot]:h-16 style-maia:*:data-[slot=input-otp-slot]:w-12 style-mira:*:data-[slot=input-otp-slot]:h-12 style-mira:*:data-[slot=input-otp-slot]:w-11',
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
																class: '*:data-[slot=input-otp-slot]:text-xl style-vega:*:data-[slot=input-otp-slot]:h-16 style-vega:*:data-[slot=input-otp-slot]:w-12 style-nova:*:data-[slot=input-otp-slot]:h-12 style-nova:*:data-[slot=input-otp-slot]:w-11 style-lyra:*:data-[slot=input-otp-slot]:h-12 style-lyra:*:data-[slot=input-otp-slot]:w-11 style-maia:*:data-[slot=input-otp-slot]:h-16 style-maia:*:data-[slot=input-otp-slot]:w-12 style-mira:*:data-[slot=input-otp-slot]:h-12 style-mira:*:data-[slot=input-otp-slot]:w-11',
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
															id: 'otp-verification',
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
														children: ($$renderer) => {
															$$renderer.push(`<a href="#/">I no longer have access to this email address.</a>`);
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

						$$renderer.push(` `);

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								class: 'flex-col gap-2',
								children: ($$renderer) => {
									if (Button.Root) {
										$$renderer.push('<!--[-->');

										Button.Root($$renderer, {
											type: 'submit',
											class: 'w-full',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Verify`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <div class="text-sm text-muted-foreground">Having trouble signing in? <a href="#/" class="underline underline-offset-4 transition-colors hover:text-primary">Contact support</a></div>`);
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