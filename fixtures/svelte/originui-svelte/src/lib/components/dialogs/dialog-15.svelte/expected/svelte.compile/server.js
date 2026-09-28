import * as $ from 'svelte/internal/server';
import Button, { buttonVariants } from '$lib/components/ui/button.svelte';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import UserRoundPlus from '@lucide/svelte/icons/user-round-plus';
import * as Dialog from '$lib/components/ui/dialog';
import { cn } from '$lib/utils';

export default function Dialog_15($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let input = null;
		let emails = ['mark@yourcompany.com', 'jane@yourcompany.com', ''];
		let copied = false;

		function addEmail() {
			emails.push('');
		}

		function handleCopy() {
			navigator.clipboard.writeText(input.value);
			copied = true;
			setTimeout(() => copied = false, 1500);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						if (Dialog.Trigger) {
							$$renderer.push('<!--[-->');

							Dialog.Trigger($$renderer, {
								class: buttonVariants({ variant: 'outline' }),
								children: ($$renderer) => {
									$$renderer.push(`<!---->Invite members`);
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
									$$renderer.push(`<div class="flex flex-col gap-2"><div class="border-border flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">`);
									UserRoundPlus($$renderer, { class: 'opacity-80', size: 16 });
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
															$$renderer.push(`<!---->Invite team members`);
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
															$$renderer.push(`<!---->Invite teammates to earn free components.`);
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
										children: ($$renderer) => {
											$$renderer.push(`<!---->Invite via email`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="space-y-3"><!--[-->`);

									const each_array = $.ensure_array_like(emails);

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let _ = each_array[index];

										Input($$renderer, {
											id: `team-email-${index + 1}`,
											placeholder: 'hi@yourcompany.com',
											type: 'email',
											get value() {
												return emails[index];
											},

											set value($$value) {
												emails[index] = $$value;
												$$settled = false;
											}
										});
									}

									$$renderer.push(`<!--]--></div></div> <button type="button" class="text-sm underline hover:no-underline">+ Add another</button></div> `);

									Button($$renderer, {
										type: 'button',
										class: 'w-full',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Send invites`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></form> <hr class="border-border my-1 border-t"/> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'input-53',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Invite via magic link`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> <div class="relative">`);

									Input($$renderer, {
										id: 'input-53',
										class: 'pe-9',
										type: 'text',
										value: 'https://originui.com/refer/87689',
										readonly: true,
										get ref() {
											return input;
										},

										set ref($$value) {
											input = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----> `);

									TooltipProvider($$renderer, {
										delayDuration: 0,
										children: ($$renderer) => {
											Tooltip($$renderer, {
												children: ($$renderer) => {
													{
														function child($$renderer, { props }) {
															$$renderer.push(`<button${$.attributes({
																...props,
																class: 'text-muted-foreground/80 hover:text-foreground focus-visible:text-foreground focus-visible:outline-ring/70 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-solid disabled:pointer-events-none disabled:cursor-not-allowed',
																'aria-label': copied ? 'Copied' : 'Copy to clipboard',
																disabled: copied
															})}><div${$.attr_class($.clsx(cn('transition-all', copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0')))}>`);

															Check($$renderer, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
															$$renderer.push(`<!----></div> <div${$.attr_class($.clsx(cn('absolute transition-all', copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100')))}>`);
															Copy($$renderer, { size: 16, 'aria-hidden': 'true' });
															$$renderer.push(`<!----></div></button>`);
														}

														TooltipTrigger($$renderer, { child, $$slots: { child: true } });
													}

													$$renderer.push(`<!----> `);

													TooltipContent($$renderer, {
														class: 'px-2 py-1 text-xs',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Copy to clipboard`);
														},
														$$slots: { default: true }
													});

													$$renderer.push(`<!---->`);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----></div></div>`);
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

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}