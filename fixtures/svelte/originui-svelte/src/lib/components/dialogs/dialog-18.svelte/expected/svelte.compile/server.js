import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import Check from '@lucide/svelte/icons/check';
import RefreshCcw from '@lucide/svelte/icons/refresh-ccw';
import * as Dialog from '$lib/components/ui/dialog';

export default function Dialog_18($$renderer, $$props) {
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
								$$renderer.push(`<!---->Change plan`);
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
								$$renderer.push(`<div class="mb-2 flex flex-col gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">`);
								RefreshCcw($$renderer, { class: 'opacity-80', size: 16 });
								$$renderer.push(`<!----></div> `);

								if (Dialog.Header) {
									$$renderer.push('<!--[-->');

									Dialog.Header($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'text-left',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Change your plan`);
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
													class: 'text-left',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Pick one of the following plans.`);
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

								$$renderer.push(`</div> <form class="space-y-5">`);

								RadioGroup($$renderer, {
									class: 'gap-2',
									value: 'plan-02',
									children: ($$renderer) => {
										$$renderer.push(`<div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5">`);

										RadioGroupItem($$renderer, {
											value: 'plan-01',
											id: 'plan-01',
											'aria-describedby': 'plan-01-description',
											class: 'order-1 after:absolute after:inset-0'
										});

										$$renderer.push(`<!----> <div class="grid grow gap-1">`);

										Label($$renderer, {
											for: 'plan-01',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Essential`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p id="plan-01-description" class="text-muted-foreground text-xs">$4 per member/month</p></div></div> <div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5">`);

										RadioGroupItem($$renderer, {
											value: 'plan-02',
											id: 'plan-02',
											'aria-describedby': 'plan-02-description',
											class: 'order-1 after:absolute after:inset-0'
										});

										$$renderer.push(`<!----> <div class="grid grow gap-1">`);

										Label($$renderer, {
											for: 'plan-02',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Standard`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p id="plan-02-description" class="text-muted-foreground text-xs">$19 per member/month</p></div></div> <div class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 shadow-xs shadow-black/5">`);

										RadioGroupItem($$renderer, {
											value: 'plan-03',
											id: 'plan-03',
											'aria-describedby': 'plan-03-description',
											class: 'order-1 after:absolute after:inset-0'
										});

										$$renderer.push(`<!----> <div class="grid grow gap-1">`);

										Label($$renderer, {
											for: 'plan-03',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Enterprise`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> <p id="plan-03-description" class="text-muted-foreground text-xs">$32 per member/month</p></div></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <div class="space-y-3"><p><strong class="text-sm font-medium">Features include:</strong></p> <ul class="text-muted-foreground space-y-2 text-sm"><li class="flex gap-2">`);

								Check($$renderer, {
									size: 16,
									class: 'text-primary mt-0.5 shrink-0',
									'aria-hidden': 'true'
								});

								$$renderer.push(`<!----> Create unlimited projects.</li> <li class="flex gap-2">`);

								Check($$renderer, {
									size: 16,
									class: 'text-primary mt-0.5 shrink-0',
									'aria-hidden': 'true'
								});

								$$renderer.push(`<!----> Remove watermarks.</li> <li class="flex gap-2">`);

								Check($$renderer, {
									size: 16,
									class: 'text-primary mt-0.5 shrink-0',
									'aria-hidden': 'true'
								});

								$$renderer.push(`<!----> Add unlimited users and free viewers.</li> <li class="flex gap-2">`);

								Check($$renderer, {
									size: 16,
									class: 'text-primary mt-0.5 shrink-0',
									'aria-hidden': 'true'
								});

								$$renderer.push(`<!----> Upload unlimited files.</li> <li class="flex gap-2">`);

								Check($$renderer, {
									size: 16,
									class: 'text-primary mt-0.5 shrink-0',
									'aria-hidden': 'true'
								});

								$$renderer.push(`<!----> 7-day money back guarantee.</li> <li class="flex gap-2">`);

								Check($$renderer, {
									size: 16,
									class: 'text-primary mt-0.5 shrink-0',
									'aria-hidden': 'true'
								});

								$$renderer.push(`<!----> Advanced permissions.</li></ul></div> <div class="grid gap-2">`);

								Button($$renderer, {
									type: 'button',
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Change plan`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								if (Dialog.Close) {
									$$renderer.push('<!--[-->');

									Dialog.Close($$renderer, {
										class: `${$.stringify(buttonVariants({ variant: 'ghost' }))} w-full`,
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

								$$renderer.push(`</div></form>`);
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