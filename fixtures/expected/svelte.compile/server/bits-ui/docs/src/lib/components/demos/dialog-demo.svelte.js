import * as $ from 'svelte/internal/server';
import { Dialog, Label, Separator } from "bits-ui";
import LockKeyOpen from "phosphor-svelte/lib/LockKeyOpen";
import X from "phosphor-svelte/lib/X";

export default function Dialog_demo($$renderer) {
	if (Dialog.Root) {
		$$renderer.push('<!--[-->');

		Dialog.Root($$renderer, {
			children: ($$renderer) => {
				if (Dialog.Trigger) {
					$$renderer.push('<!--[-->');

					Dialog.Trigger($$renderer, {
						class: 'rounded-input bg-dark text-background\n	  shadow-mini hover:bg-dark/95 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden\n	  inline-flex h-12 items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
						children: ($$renderer) => {
							$$renderer.push(`<!---->New API key`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Dialog.Portal) {
					$$renderer.push('<!--[-->');

					Dialog.Portal($$renderer, {
						children: ($$renderer) => {
							if (Dialog.Overlay) {
								$$renderer.push('<!--[-->');

								Dialog.Overlay($$renderer, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
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
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] border p-5 sm:max-w-[490px] md:w-full',
									children: ($$renderer) => {
										if (Dialog.Title) {
											$$renderer.push('<!--[-->');

											Dialog.Title($$renderer, {
												class: 'flex w-full items-center justify-center text-lg font-semibold tracking-tight',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Create API key`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Separator.Root) {
											$$renderer.push('<!--[-->');
											Separator.Root($$renderer, { class: 'bg-muted -mx-5 mb-6 mt-5 block h-px' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Dialog.Description) {
											$$renderer.push('<!--[-->');

											Dialog.Description($$renderer, {
												class: 'text-foreground-alt text-sm',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Create and manage API keys. You can create multiple keys to organize your
				applications.`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <div class="flex flex-col items-start gap-1 pb-11 pt-7">`);

										if (Label.Root) {
											$$renderer.push('<!--[-->');

											Label.Root($$renderer, {
												for: 'apiKey',
												class: 'text-sm font-medium',
												children: ($$renderer) => {
													$$renderer.push(`<!---->API Key`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <div class="relative w-full"><input id="apiKey" class="h-input rounded-card-sm border-border-input bg-background placeholder:text-foreground-alt/50 hover:border-dark-40 focus:ring-foreground focus:ring-offset-background focus:outline-hidden inline-flex w-full items-center border px-4 text-base focus:ring-2 focus:ring-offset-2 sm:text-sm" placeholder="secret_api_key" name="name"/> `);

										LockKeyOpen($$renderer, {
											class: 'text-dark/30 absolute right-4 top-[14px] size-[22px]'
										});

										$$renderer.push(`<!----></div></div> <div class="flex w-full justify-end">`);

										if (Dialog.Close) {
											$$renderer.push('<!--[-->');

											Dialog.Close($$renderer, {
												class: 'h-input rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex items-center justify-center px-[50px] text-[15px] font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Save`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div> `);

										if (Dialog.Close) {
											$$renderer.push('<!--[-->');

											Dialog.Close($$renderer, {
												class: 'focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden absolute right-5 top-5 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$renderer) => {
													$$renderer.push(`<div>`);
													X($$renderer, { class: 'text-foreground size-5' });
													$$renderer.push(`<!----> <span class="sr-only">Close</span></div>`);
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

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}