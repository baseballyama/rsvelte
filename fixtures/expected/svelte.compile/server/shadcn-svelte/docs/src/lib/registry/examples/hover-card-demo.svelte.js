import * as $ from 'svelte/internal/server';
import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
import * as Avatar from "$lib/registry/ui/avatar/index.js";
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";

export default function Hover_card_demo($$renderer) {
	if (HoverCard.Root) {
		$$renderer.push('<!--[-->');

		HoverCard.Root($$renderer, {
			children: ($$renderer) => {
				if (HoverCard.Trigger) {
					$$renderer.push('<!--[-->');

					HoverCard.Trigger($$renderer, {
						href: 'https://github.com/sveltejs',
						target: '_blank',
						rel: 'noreferrer noopener',
						class: 'rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black',
						children: ($$renderer) => {
							$$renderer.push(`<!---->@sveltejs`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (HoverCard.Content) {
					$$renderer.push('<!--[-->');

					HoverCard.Content($$renderer, {
						class: 'w-80',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex justify-between space-x-4">`);

							if (Avatar.Root) {
								$$renderer.push('<!--[-->');

								Avatar.Root($$renderer, {
									children: ($$renderer) => {
										if (Avatar.Image) {
											$$renderer.push('<!--[-->');
											Avatar.Image($$renderer, { src: 'https://github.com/sveltejs.png' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Avatar.Fallback) {
											$$renderer.push('<!--[-->');

											Avatar.Fallback($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->SK`);
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

							$$renderer.push(` <div class="space-y-1"><h4 class="text-sm font-semibold">@sveltejs</h4> <p class="text-sm">Cybernetically enhanced web apps.</p> <div class="flex items-center pt-2">`);
							CalendarDaysIcon($$renderer, { class: 'me-2 size-4 opacity-70' });
							$$renderer.push(`<!----> <span class="text-xs text-muted-foreground">Joined September 2022</span></div></div></div>`);
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