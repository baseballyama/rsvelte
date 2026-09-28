import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Mail from '@lucide/svelte/icons/mail';
import * as Dialog from '$lib/components/ui/dialog';

export default function Dialog_09($$renderer, $$props) {
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
								$$renderer.push(`<!---->Newsletter`);
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
								$$renderer.push(`<div class="mb-2 flex flex-col items-center gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true"><svg class="stroke-svelte size-6" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke-width="2"></circle><circle cx="16" cy="16" r="9" fill="none" stroke-width="2"></circle></svg></div> `);

								if (Dialog.Header) {
									$$renderer.push('<!--[-->');

									Dialog.Header($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'sm:text-center',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Never miss an update`);
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
														$$renderer.push(`<!---->Subscribe to receive news and special offers.`);
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

								$$renderer.push(`</div> <form class="space-y-5"><div class="space-y-2"><div class="relative">`);

								Input($$renderer, {
									id: 'dialog.-subscribe',
									class: 'peer ps-9',
									placeholder: 'hi@yourcompany.com',
									type: 'email',
									'aria-label': 'Email'
								});

								$$renderer.push(`<!----> <div class="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">`);
								Mail($$renderer, { size: 16, 'aria-hidden': 'true' });
								$$renderer.push(`<!----></div></div></div> `);

								Button($$renderer, {
									type: 'button',
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Subscribe`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></form> <p class="text-muted-foreground text-center text-xs">By subscribing you agree to our <a class="underline hover:no-underline" href="#title">Privacy Policy</a>.</p>`);
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