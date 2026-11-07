import * as $ from 'svelte/internal/server';
import XIcon from '@lucide/svelte/icons/x';
import { Avatar, Popover, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	Popover($$renderer, {
		children: ($$renderer) => {
			if (Popover.Trigger) {
				$$renderer.push('<!--[-->');

				Popover.Trigger($$renderer, {
					class: 'btn preset-filled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Trigger`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Portal($$renderer, {
				children: ($$renderer) => {
					if (Popover.Positioner) {
						$$renderer.push('<!--[-->');

						Popover.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										class: 'card w-96 p-4 bg-surface-100-900 shadow-xl',
										children: ($$renderer) => {
											$$renderer.push(`<div class="space-y-4"><header class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">`);

											Avatar($$renderer, {
												children: ($$renderer) => {
													if (Avatar.Image) {
														$$renderer.push('<!--[-->');

														Avatar.Image($$renderer, {
															src: 'https://cdn.bsky.app/img/avatar/plain/did:plc:whtgi5zx7ylmdw2i76vq7vq4/bafkreibgoxuqahwcpiah22yfovqszh33x2u4sysmqoyuk5j54aoakt7364@jpeg',
															alt: 'Skeleton Labs'
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> <div>`);

											if (Popover.Title) {
												$$renderer.push('<!--[-->');

												Popover.Title($$renderer, {
													class: 'text-lg font-bold',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Skeleton Labs`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <a href="https://bsky.app/profile/skeleton.dev" target="_blank" class="anchor">@skeletonlabs.dev</a></div> `);

											if (Popover.CloseTrigger) {
												$$renderer.push('<!--[-->');

												Popover.CloseTrigger($$renderer, {
													class: 'btn-icon hover:preset-tonal self-start',
													children: ($$renderer) => {
														XIcon($$renderer, { class: 'size-4' });
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(`</header> `);

											if (Popover.Description) {
												$$renderer.push('<!--[-->');

												Popover.Description($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Your friendly neighborhood open source maintainers. Creators of Skeleton.`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <div class="flex gap-4"><p class="text-sm">800 <span class="opacity-60">Followers</span></p> <p class="text-sm">120 <span class="opacity-60">Following</span></p> <p class="text-sm">100 <span class="opacity-60">Posts</span></p></div></div> `);

											if (Popover.Arrow) {
												$$renderer.push('<!--[-->');

												Popover.Arrow($$renderer, {
													class: '[--arrow-size:--spacing(2)] [--arrow-background:var(--color-surface-100-900)]',
													children: ($$renderer) => {
														if (Popover.ArrowTip) {
															$$renderer.push('<!--[-->');
															Popover.ArrowTip($$renderer, {});
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

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}