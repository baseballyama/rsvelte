import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Label from '$lib/components/ui/label.svelte';
import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group/index.js';
import Textarea from '$lib/components/ui/textarea.svelte';
import * as Dialog from '$lib/components/ui/dialog';

export default function Dialog_11($$renderer, $$props) {
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
								$$renderer.push(`<!---->Rating`);
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
							class: 'flex flex-col gap-0 p-0 [&>button:last-child]:top-3.5',
							children: ($$renderer) => {
								if (Dialog.Header) {
									$$renderer.push('<!--[-->');

									Dialog.Header($$renderer, {
										class: 'contents space-y-0 text-left',
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													class: 'border-border border-b px-6 py-4 text-base',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Help us improve`);
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

								$$renderer.push(` <div class="px-6 py-4"><form class="space-y-5"><div class="space-y-4"><div><fieldset class="space-y-4"><legend class="text-foreground text-lg leading-none font-semibold">How hard was it to set up your account?</legend> `);

								RadioGroup($$renderer, {
									value: '',
									class: 'flex gap-0 -space-x-px rounded-lg shadow-xs shadow-black/5',
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(Array.from({ length: 9 }));

										for (let index = 0, $$length = each_array.length; index < $$length; index++) {
											let _ = each_array[index];

											$$renderer.push(`<label${$.attr('for', `radio-17-r${$.stringify(index)}`)} class="border-input has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-focus-visible:outline-ring/70 relative flex size-9 flex-1 cursor-pointer flex-col items-center justify-center gap-3 border text-center text-sm outline-offset-2 transition-colors first:rounded-s-lg last:rounded-e-lg has-focus-visible:outline-2 has-focus-visible:outline-solid has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[state=checked]:z-10">`);

											RadioGroupItem($$renderer, {
												id: `radio-17-r${$.stringify(index)}`,
												value: `r${$.stringify(index)}`,
												class: 'sr-only after:absolute after:inset-0'
											});

											$$renderer.push(`<!----> ${$.escape(index)}</label>`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></fieldset> <div class="text-muted-foreground mt-2 flex justify-between text-xs"><p>Very easy</p> <p>Very dificult</p></div></div> <div class="space-y-2">`);

								Label($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Why did you give this rating?`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Textarea($$renderer, {
									id: 'feedback',
									placeholder: 'How can we improve Origin UI?',
									'aria-label': 'Send feedback'
								});

								$$renderer.push(`<!----></div></div> `);

								Button($$renderer, {
									type: 'button',
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Send feedback`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></form></div>`);
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