import * as $ from 'svelte/internal/server';
import { Marquee } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ emoji: '🐉', label: 'Dragon' },
			{ emoji: '🧙', label: 'Wizard' },
			{ emoji: '⚔️', label: 'Knight' },
			{ emoji: '💀', label: 'Skeleton' },
			{ emoji: '🏰', label: 'Castle' },
			{ emoji: '🧝', label: 'Elf' },
			{ emoji: '🗡️', label: 'Rogue' },
			{ emoji: '🛡️', label: 'Paladin' }
		];

		$$renderer.push(`<div class="space-y-10"><header><h1 class="h1">Marquee</h1></header> <section class="space-y-4"><h2 class="h2">Default</h2> `);

		Marquee($$renderer, {
			autoFill: true,
			pauseOnInteraction: true,
			children: ($$renderer) => {
				if (Marquee.Edge) {
					$$renderer.push('<!--[-->');
					Marquee.Edge($$renderer, { side: 'start' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Marquee.Viewport) {
					$$renderer.push('<!--[-->');

					Marquee.Viewport($$renderer, {
						children: ($$renderer) => {
							{
								function children($$renderer, marquee) {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(Array.from({ length: marquee().contentCount }));

									for (let index = 0, $$length = each_array.length; index < $$length; index++) {
										let _ = each_array[index];

										if (Marquee.Content) {
											$$renderer.push('<!--[-->');

											Marquee.Content($$renderer, {
												index,
												children: ($$renderer) => {
													$$renderer.push(`<!--[-->`);

													const each_array_1 = $.ensure_array_like(items);

													for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
														let item = each_array_1[$$index];

														$$renderer.push(`<div class="card bg-surface-100-900 flex items-center gap-3 px-6 py-4 whitespace-nowrap"><span class="text-3xl">${$.escape(item.emoji)}</span> <span class="font-medium">${$.escape(item.label)}</span></div>`);
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
									}

									$$renderer.push(`<!--]-->`);
								}

								if (Marquee.Context) {
									$$renderer.push('<!--[-->');
									Marquee.Context($$renderer, { children, $$slots: { default: true } });
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

				$$renderer.push(` `);

				if (Marquee.Edge) {
					$$renderer.push('<!--[-->');
					Marquee.Edge($$renderer, { side: 'end' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></section></div>`);
	});
}