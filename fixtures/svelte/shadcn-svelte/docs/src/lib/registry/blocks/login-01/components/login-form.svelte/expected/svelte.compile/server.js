import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "$lib/registry/ui/field/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

export default function Login_form($$renderer) {
	const id = $.props_id($$renderer);

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			class: 'mx-auto w-full max-w-sm',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									class: 'text-2xl',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Login`);
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
										$$renderer.push(`<!---->Enter your email below to login to your account`);
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

											$$renderer.push(`<!----> <a href="##" class="ms-auto inline-block text-sm underline">Forgot your password?</a></div> `);
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
												class: 'w-full',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Login`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											Button($$renderer, {
												variant: 'outline',
												class: 'w-full',
												children: ($$renderer) => {
													$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"></path></svg> Login with Google`);
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
}