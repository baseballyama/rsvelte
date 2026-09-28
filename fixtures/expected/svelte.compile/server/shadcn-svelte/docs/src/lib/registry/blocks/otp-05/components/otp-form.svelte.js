import * as $ from 'svelte/internal/server';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

export default function Otp_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("flex flex-col gap-6", className)),
			...restProps
		})}><form>`);

		if (Field.Group) {
			$$renderer.push('<!--[-->');

			Field.Group($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-col items-center gap-2 text-center"><a href="#/" class="flex flex-col items-center gap-2 font-medium"><div class="flex size-8 items-center justify-center rounded-md">`);
					GalleryVerticalEndIcon($$renderer, { class: 'size-6' });
					$$renderer.push(`<!----></div> <span class="sr-only">Acme Inc.</span></a> <h1 class="text-xl font-bold">Enter verification code</h1> `);

					if (Field.Description) {
						$$renderer.push('<!--[-->');

						Field.Description($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->We sent a 6-digit code to your email address`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div> `);

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
												class: 'gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl',
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
												class: 'gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl',
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

		$$renderer.push(`</form> `);

		if (Field.Description) {
			$$renderer.push('<!--[-->');

			Field.Description($$renderer, {
				class: 'px-6 text-center',
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