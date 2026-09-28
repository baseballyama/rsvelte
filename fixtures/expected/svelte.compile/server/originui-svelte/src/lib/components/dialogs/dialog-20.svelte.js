import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import DialogImg from '$lib/assets/dialog-content.png';
import * as Dialog from '$lib/components/ui/dialog';
import { cn } from '$lib/utils';

export default function Dialog_20($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const steps = [
			{
				description: 'Discover a powerful collection of components designed to enhance your development workflow.',
				title: 'Welcome to Origin UI'
			},

			{
				description: 'Each component is fully customizable and built with modern web standards in mind.',
				title: 'Customizable Components'
			},

			{
				description: 'Begin building amazing interfaces with our comprehensive component library.',
				title: 'Ready to Start?'
			},

			{
				description: 'Access our extensive documentation and community resources to make the most of Origin UI.',
				title: 'Get Support'
			}
		];

		let step = 1;

		function handleContinue() {
			if (step < steps.length) {
				step += 1;
			}
		}

		if (Dialog.Root) {
			$$renderer.push('<!--[-->');

			Dialog.Root($$renderer, {
				onOpenChange: (open) => {
					if (open) step = 1;
				},

				children: ($$renderer) => {
					if (Dialog.Trigger) {
						$$renderer.push('<!--[-->');

						Dialog.Trigger($$renderer, {
							class: buttonVariants({ variant: 'outline' }),
							children: ($$renderer) => {
								$$renderer.push(`<!---->Onboarding`);
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
							class: 'gap-0 p-0 [&>button:last-child]:text-white',
							children: ($$renderer) => {
								$$renderer.push(`<div class="p-2"><img class="w-full rounded-lg"${$.attr('src', DialogImg)}${$.attr('width', 382)}${$.attr('height', 216)} alt="dialog"/></div> <div class="space-y-6 px-6 pt-3 pb-6">`);

								if (Dialog.Header) {
									$$renderer.push('<!--[-->');

									Dialog.Header($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Title) {
												$$renderer.push('<!--[-->');

												Dialog.Title($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(steps[step - 1].title)}`);
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
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(steps[step - 1].description)}`);
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

								$$renderer.push(` <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div class="flex justify-center space-x-1.5 max-sm:order-1"><!--[-->`);

								const each_array = $.ensure_array_like({ length: steps.length });

								for (let index = 0, $$length = each_array.length; index < $$length; index++) {
									let _ = each_array[index];

									$$renderer.push(`<div${$.attr_class($.clsx(cn('bg-primary h-1.5 w-1.5 rounded-full', index + 1 === step ? 'bg-primary' : 'opacity-20')))}></div>`);
								}

								$$renderer.push(`<!--]--></div> `);

								if (Dialog.Footer) {
									$$renderer.push('<!--[-->');

									Dialog.Footer($$renderer, {
										children: ($$renderer) => {
											if (Dialog.Close) {
												$$renderer.push('<!--[-->');

												Dialog.Close($$renderer, {
													class: buttonVariants({ variant: 'ghost' }),
													children: ($$renderer) => {
														$$renderer.push(`<!---->Skip`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (step < steps.length) {
												$$renderer.push('<!--[0-->');

												Button($$renderer, {
													class: 'group',
													type: 'button',
													onclick: handleContinue,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Next `);

														ArrowRight($$renderer, {
															className: '-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5',
															size: 16,
															'aria-hidden': 'true'
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});
											} else {
												$$renderer.push('<!--[-1-->');

												if (Dialog.Close) {
													$$renderer.push('<!--[-->');

													Dialog.Close($$renderer, {
														class: buttonVariants(),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Okay`);
														},
														$$slots: { default: true }
													});

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

								$$renderer.push(`</div></div>`);
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