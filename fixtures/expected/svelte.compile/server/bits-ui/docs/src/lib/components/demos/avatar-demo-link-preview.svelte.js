import * as $ from 'svelte/internal/server';
import { Avatar, LinkPreview } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import MapPin from "phosphor-svelte/lib/MapPin";

export default function Avatar_demo_link_preview($$renderer) {
	if (LinkPreview.Root) {
		$$renderer.push('<!--[-->');

		LinkPreview.Root($$renderer, {
			children: ($$renderer) => {
				if (LinkPreview.Trigger) {
					$$renderer.push('<!--[-->');

					LinkPreview.Trigger($$renderer, {
						href: 'https://x.com/huntabyte',
						target: '_blank',
						rel: 'noreferrer noopener',
						class: 'rounded-xs underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black',
						children: ($$renderer) => {
							if (Avatar.Root) {
								$$renderer.push('<!--[-->');

								Avatar.Root($$renderer, {
									class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border border-transparent text-[17px] font-medium uppercase',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent">`);

										if (Avatar.Image) {
											$$renderer.push('<!--[-->');
											Avatar.Image($$renderer, { src: '/avatar-1.png', alt: '@huntabyte' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Avatar.Fallback) {
											$$renderer.push('<!--[-->');

											Avatar.Fallback($$renderer, {
												class: 'border-muted border',
												children: ($$renderer) => {
													$$renderer.push(`<!---->HB`);
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

				$$renderer.push(` `);

				if (LinkPreview.Content) {
					$$renderer.push('<!--[-->');

					LinkPreview.Content($$renderer, {
						class: 'border-muted bg-background shadow-popover w-[331px] rounded-xl border p-[17px]',
						sideOffset: 8,
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex space-x-4">`);

							if (Avatar.Root) {
								$$renderer.push('<!--[-->');

								Avatar.Root($$renderer, {
									class: 'data-[status=loaded]:border-foreground bg-muted text-muted-foreground h-12 w-12 rounded-full border border-transparent text-[17px] font-medium uppercase',
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-transparent">`);

										if (Avatar.Image) {
											$$renderer.push('<!--[-->');
											Avatar.Image($$renderer, { src: '/avatar-1.png', alt: '@huntabyte' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Avatar.Fallback) {
											$$renderer.push('<!--[-->');

											Avatar.Fallback($$renderer, {
												class: 'border-muted border',
												children: ($$renderer) => {
													$$renderer.push(`<!---->HB`);
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

							$$renderer.push(` <div class="space-y-1 text-sm"><h4 class="font-medium">@huntabyte</h4> <p>I do things on the internet.</p> <div class="text-muted-foreground flex items-center gap-[21px] pt-2 text-xs"><div class="flex items-center text-xs">`);
							MapPin($$renderer, { class: 'mr-1 size-4' });
							$$renderer.push(`<!----> <span>FL, USA</span></div> <div class="flex items-center text-xs">`);
							CalendarBlank($$renderer, { class: 'mr-1 size-4' });
							$$renderer.push(`<!----> <span>Joined May 2020</span></div></div></div></div>`);
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