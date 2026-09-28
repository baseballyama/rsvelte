import * as $ from 'svelte/internal/server';
import { Avatar, LinkPreview } from "bits-ui";
import CalendarBlank from "phosphor-svelte/lib/CalendarBlank";
import MapPin from "phosphor-svelte/lib/MapPin";
import { fly } from "svelte/transition";

export default function Link_preview_demo_transition($$renderer) {
	let loadingStatusTrigger = "loading";
	let loadingStatusContent = "loading";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (LinkPreview.Root) {
			$$renderer.push('<!--[-->');

			LinkPreview.Root($$renderer, {
				children: ($$renderer) => {
					if (LinkPreview.Trigger) {
						$$renderer.push('<!--[-->');

						LinkPreview.Trigger($$renderer, {
							href: 'https://github.com/sveltejs',
							target: '_blank',
							rel: 'noreferrer noopener',
							class: 'rounded-xs underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black',
							children: ($$renderer) => {
								if (Avatar.Root) {
									$$renderer.push('<!--[-->');

									Avatar.Root($$renderer, {
										class: `h-12 w-12 rounded-full border ${loadingStatusTrigger === 'loaded' ? 'border-foreground' : 'border-transparent'} bg-muted text-muted-foreground text-[17px] font-medium uppercase`,
										get loadingStatus() {
											return loadingStatusTrigger;
										},

										set loadingStatus($$value) {
											loadingStatusTrigger = $$value;
											$$settled = false;
										},

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

					{
						function child($$renderer, { open, props, wrapperProps }) {
							if (open) {
								$$renderer.push(`<!--[0--><div${$.attributes({ ...wrapperProps })}><div${$.attributes({ ...props })}><div class="flex space-x-4">`);

								if (Avatar.Root) {
									$$renderer.push('<!--[-->');

									Avatar.Root($$renderer, {
										class: `h-12 w-12 rounded-full border ${loadingStatusContent === 'loaded' ? 'border-foreground' : 'border-transparent'} bg-muted text-muted-foreground text-[17px] font-medium uppercase`,
										get loadingStatus() {
											return loadingStatusContent;
										},

										set loadingStatus($$value) {
											loadingStatusContent = $$value;
											$$settled = false;
										},

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
								$$renderer.push(`<!----> <span>Joined May 2020</span></div></div></div></div></div></div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						if (LinkPreview.Content) {
							$$renderer.push('<!--[-->');

							LinkPreview.Content($$renderer, {
								class: 'border-muted bg-background shadow-popover w-[331px] rounded-xl border p-[17px]',
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}