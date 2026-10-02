import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

import {
	FieldGroup,
	Field,
	FieldLabel,
	FieldDescription,
	FieldSeparator
} from "$lib/registry/ui/field/index.js";

import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

export default function Login_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		let { class: className, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(cn("flex flex-col gap-6", className)),
			...restProps
		})}>`);

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
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
											$$renderer.push(`<!---->Welcome back`);
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
											$$renderer.push(`<!---->Login with your Apple or Google account`);
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

								FieldGroup($$renderer, {
									children: ($$renderer) => {
										Field($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													type: 'button',
													children: ($$renderer) => {
														$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor"></path></svg> Login with Apple`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													variant: 'outline',
													type: 'button',
													children: ($$renderer) => {
														$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"></path></svg> Login with Google`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										FieldSeparator($$renderer, {
											class: '*:data-[slot=field-separator-content]:bg-card',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Or continue with`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Field($$renderer, {
											children: ($$renderer) => {
												FieldLabel($$renderer, {
													for: `email-${id}`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Email`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Input($$renderer, {
													id: `email-${id}`,
													type: 'email',
													placeholder: 'm@example.com',
													required: true
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Field($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex items-center">`);

												FieldLabel($$renderer, {
													for: `password-${id}`,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Password`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> <a href="##" class="ms-auto text-sm underline-offset-4 hover:underline">Forgot your password?</a></div> `);
												Input($$renderer, { id: `password-${id}`, type: 'password', required: true });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Field($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													type: 'submit',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Login`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												FieldDescription($$renderer, {
													class: 'text-center',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Don't have an account? <a href="##">Sign up</a>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></form>`);
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

		FieldDescription($$renderer, {
			class: 'px-6 text-center',
			children: ($$renderer) => {
				$$renderer.push(`<!---->By clicking continue, you agree to our <a href="##">Terms of Service</a> and <a href="##">Privacy Policy</a>.`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}