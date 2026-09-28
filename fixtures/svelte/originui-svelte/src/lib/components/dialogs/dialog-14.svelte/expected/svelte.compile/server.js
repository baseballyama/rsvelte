import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Checkbox from '$lib/components/ui/checkbox.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import * as Dialog from '$lib/components/ui/dialog';

export default function Dialog_14($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				children: ($$renderer) => {
					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							class: buttonVariants({ variant: 'outline' }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Sign in`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Dialog.Content) {
						$$renderer.push('<!--[-->');

						Dialog.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col items-center gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><svg class="stroke-svelte size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke-width="2"></circle><circle cx="16" cy="16" r="9" fill="none" stroke-width="2"></circle></svg></div> `);

								if (Dialog.Header) {
									$$renderer.push('<!--[-->');

									Dialog.Header($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'sm:text-center',
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

											if (Dialog.Description) {
												$$renderer.push('<!--[-->');

												Dialog.Description($$renderer, {
													class: 'sm:text-center',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Enter your credentials to login to your account.`);
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

								$$renderer.push(`</div> <form class="space-y-5"><div class="space-y-4"><div class="space-y-2">`);

								Label($$renderer, {
									for: 'login-email',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Email`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'login-email',
									placeholder: 'hi@yourcompany.com',
									type: 'email',
									required: true
								});

								$$renderer.push(`<!----></div> <div class="space-y-2">`);

								Label($$renderer, {
									for: 'login-password',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Password`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Input($$renderer, {
									id: 'login-password',
									placeholder: 'Enter your password',
									type: 'password',
									required: true
								});

								$$renderer.push(`<!----></div></div> <div class="flex justify-between gap-2"><div class="flex items-center gap-2">`);
								Checkbox($$renderer, { id: 'login-remember' });
								$$renderer.push(`<!----> `);

								Label($$renderer, {
									for: 'login-remember',
									class: 'text-muted-foreground font-normal',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Remember me`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div> <a class="text-sm underline hover:no-underline" href="#title">Forgot password?</a></div> `);

								Button($$renderer, {
									type: 'button',
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Sign in`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></form> <div class="before:bg-border after:bg-border flex items-center gap-3 before:h-px before:flex-1 after:h-px after:flex-1"><span class="text-muted-foreground text-xs">Or</span></div> `);

								Button($$renderer, {
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Login with Google`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
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
	});
}