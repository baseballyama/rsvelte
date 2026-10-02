import * as $ from 'svelte/internal/server';
import { AlertDialog } from "bits-ui";

export default function Alert_dialog_demo($$renderer) {
	if (AlertDialog.Root) {
		$$renderer.push('<!--[-->');

		AlertDialog.Root($$renderer, {
			children: ($$renderer) => {
				if (AlertDialog.Trigger) {
					$$renderer.push('<!--[-->');

					AlertDialog.Trigger($$renderer, {
						class: 'rounded-input bg-dark text-background\n	shadow-mini hover:bg-dark/95 inline-flex h-12 select-none\n	items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-semibold transition-all active:scale-[0.98]',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Subscribe`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (AlertDialog.Portal) {
					$$renderer.push('<!--[-->');

					AlertDialog.Portal($$renderer, {
						children: ($$renderer) => {
							if (AlertDialog.Overlay) {
								$$renderer.push('<!--[-->');

								AlertDialog.Overlay($$renderer, {
									class: 'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80'
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (AlertDialog.Content) {
								$$renderer.push('<!--[-->');

								AlertDialog.Content($$renderer, {
									class: 'rounded-card-lg bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 outline-hidden fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-7 sm:max-w-lg md:w-full ',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex flex-col gap-4 pb-6">`);

										if (AlertDialog.Title) {
											$$renderer.push('<!--[-->');

											AlertDialog.Title($$renderer, {
												class: 'text-lg font-semibold tracking-tight',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Confirm your transaction`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (AlertDialog.Description) {
											$$renderer.push('<!--[-->');

											AlertDialog.Description($$renderer, {
												class: 'text-foreground-alt text-sm',
												children: ($$renderer) => {
													$$renderer.push(`<!---->This action cannot be undone. This will initiate a monthly wire in the amount of
					$10,000 to Huntabyte. Do you wish to continue?`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div> <div class="flex w-full items-center justify-center gap-2">`);

										if (AlertDialog.Cancel) {
											$$renderer.push('<!--[-->');

											AlertDialog.Cancel($$renderer, {
												class: 'h-input rounded-input bg-muted shadow-mini hover:bg-dark-10 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Cancel`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (AlertDialog.Action) {
											$$renderer.push('<!--[-->');

											AlertDialog.Action($$renderer, {
												class: 'h-input rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex w-full items-center justify-center text-[15px] font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Continue`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div>`);
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