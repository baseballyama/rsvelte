import * as $ from 'svelte/internal/server';
import { Button, Popover, Separator } from "bits-ui";
import MapPin from "phosphor-svelte/lib/MapPin";
import Calendar from "phosphor-svelte/lib/Calendar";

export default function Popover_demo_hover($$renderer) {
	if (Popover.Root) {
		$$renderer.push('<!--[-->');

		Popover.Root($$renderer, {
			children: ($$renderer) => {
				if (Popover.Trigger) {
					$$renderer.push('<!--[-->');

					Popover.Trigger($$renderer, {
						openOnHover: true,
						openDelay: 200,
						closeDelay: 100,
						class: 'bg-muted hover:bg-muted/80 inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors',
						children: ($$renderer) => {
							$$renderer.push(`<img src="https://github.com/huntabyte.png" alt="" class="size-6 rounded-full object-cover"/> huntabyte`);
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
							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									class: 'border-dark-10 bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-popover-content-transform-origin) z-30 w-full max-w-[300px] rounded-[12px] border p-4 focus-visible:outline-none',
									sideOffset: 8,
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-start justify-between gap-3"><div class="flex items-start gap-3"><div class="bg-muted flex size-12 shrink-0 items-center justify-center rounded-full"><img src="https://github.com/huntabyte.png" alt="Hunter Johnston" class="size-full rounded-full object-cover"/></div> <div class="flex flex-col gap-0.5"><span class="text-[15px] font-semibold leading-5">Hunter Johnston</span> <span class="text-muted-foreground text-sm">@huntabyte</span></div></div> `);

										if (Button.Root) {
											$$renderer.push('<!--[-->');

											Button.Root($$renderer, {
												href: 'https://x.com/huntabyte',
												target: '_blank',
												class: 'bg-dark text-background shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-opacity hover:opacity-90',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Follow`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div> <p class="text-foreground/90 mt-3 text-sm leading-relaxed">Building Bits UI and other open source tools for the Svelte ecosystem.</p> `);

										if (Separator.Root) {
											$$renderer.push('<!--[-->');
											Separator.Root($$renderer, { class: 'bg-dark-10 -mx-4 my-3 block h-px' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` <div class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs"><span class="inline-flex items-center gap-1">`);
										MapPin($$renderer, { class: 'size-3.5' });
										$$renderer.push(`<!----> FL, USA</span> <span class="inline-flex items-center gap-1">`);
										Calendar($$renderer, { class: 'size-3.5' });
										$$renderer.push(`<!----> Joined 2020</span></div>`);
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