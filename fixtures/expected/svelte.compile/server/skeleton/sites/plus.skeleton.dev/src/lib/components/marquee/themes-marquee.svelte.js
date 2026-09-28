import * as $ from 'svelte/internal/server';
import { themes } from './themes.js';
import { Marquee } from '@skeletonlabs/skeleton-svelte';

export default function Themes_marquee($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function shuffle(arr) {
			const result = [...arr];

			for (let i = result.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));

				[result[i], result[j]] = [result[j], result[i]];
			}

			return result;
		}

		const rows = [1, 2, 3, 4].map(() => shuffle(themes));

		$$renderer.push(`<div class="space-y-3 py-4 overflow-hidden"><!--[-->`);

		const each_array = $.ensure_array_like(rows);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let row = each_array[i];

			Marquee($$renderer, {
				reverse: i % 2 === 1,
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

										const each_array_1 = $.ensure_array_like(Array.from({ length: marquee().contentCount }));

										for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
											let _ = each_array_1[index];

											if (Marquee.Content) {
												$$renderer.push('<!--[-->');

												Marquee.Content($$renderer, {
													index,
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_2 = $.ensure_array_like(row);

														for (let $$index = 0, $$length = each_array_2.length; $$index < $$length; $$index++) {
															let theme = each_array_2[$$index];

															$$renderer.push(`<div class="card ring ring-inset ring-surface-950-50/10 flex items-center gap-2 px-4 py-2 whitespace-nowrap"${$.attr_style(`background-color: light-dark(${$.stringify(theme.surface50)}, ${$.stringify(theme.surface950)});`)}><span>${$.escape(theme.emoji)}</span> <span class="text-sm font-medium">${$.escape(theme.name)}</span> <div class="flex gap-1"><span class="size-3 rounded-full"${$.attr_style(`background-color: ${$.stringify(theme.primary500)};`)}></span> <span class="size-3 rounded-full"${$.attr_style(`background-color: ${$.stringify(theme.secondary500)};`)}></span> <span class="size-3 rounded-full"${$.attr_style(`background-color: ${$.stringify(theme.tertiary500)};`)}></span></div></div>`);
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
		}

		$$renderer.push(`<!--]--></div>`);
	});
}