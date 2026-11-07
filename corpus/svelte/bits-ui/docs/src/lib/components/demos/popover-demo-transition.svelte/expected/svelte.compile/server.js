import * as $ from 'svelte/internal/server';
import { Popover, Separator, Toggle } from "bits-ui";
import ImageSquare from "phosphor-svelte/lib/ImageSquare";
import LinkSimpleHorizontalBreak from "phosphor-svelte/lib/LinkSimpleHorizontalBreak";
import { fly } from "svelte/transition";

export default function Popover_demo_transition($$renderer) {
	let width = 1024;
	let height = 768;

	if (Popover.Root) {
		$$renderer.push('<!--[-->');

		Popover.Root($$renderer, {
			children: ($$renderer) => {
				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						class: 'rounded-input bg-dark\n	text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Resize`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Popover.Portal) {
					$$renderer.push('<!--[-->');

					Popover.Portal($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { wrapperProps, props, open }) {
									if (open) {
										$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}><div class="flex items-center"><div class="bg-muted mr-3 flex size-12 items-center justify-center rounded-full">`);
										ImageSquare($$renderer, { class: 'size-6' });
										$$renderer.push(`<!----></div> <div class="flex flex-col"><h4 class="text-[17px] font-semibold leading-5 tracking-[-0.01em]">Resize image</h4> <p class="text-muted-foreground text-sm font-medium">Resize your photos easily</p></div></div> `);

										if (Separator.Root) {
											$$renderer.push('<!--[-->');
											Separator.Root($$renderer, { class: 'bg-dark-10 -mx-4 mb-6 mt-[17px] block h-px' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <div class="flex items-center pb-2"><div class="mr-2 flex items-center"><div class="relative mr-2"><span class="sr-only">Width</span> <span aria-hidden="true" class="text-xxs text-muted-foreground absolute left-5 top-4">W</span> <input type="number" class="h-input rounded-10px border-border-input bg-background text-foreground w-[119px] border pl-10 pr-2 text-base sm:text-sm"${$.attr('value', width)}/></div> <div class="relative"><span class="sr-only">Height</span> <span aria-hidden="true" class="text-xxs text-muted-foreground absolute left-5 top-4">H</span> <input type="number" class="h-input rounded-10px border-border-input bg-background text-foreground w-[119px] border pl-10 pr-2 text-base sm:text-sm"${$.attr('value', height)}/></div></div> `);

										if (Toggle.Root) {
											$$renderer.push('<!--[-->');

											Toggle.Root($$renderer, {
												'aria-label': 'toggle constrain portions',
												class: 'bg-background hover:bg-muted data-[state=on]:bg-muted inline-flex size-10 items-center justify-center rounded-[9px] transition-all active:scale-[0.98]',
												children: ($$renderer) => {
													LinkSimpleHorizontalBreak($$renderer, { class: 'size-6' });
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div></div></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										class: 'border-dark-10 bg-background shadow-popover z-30 w-full max-w-[328px] rounded-[12px] border p-4',
										sideOffset: 8,
										forceMount: true,
										child,
										$$slots: { child: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
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