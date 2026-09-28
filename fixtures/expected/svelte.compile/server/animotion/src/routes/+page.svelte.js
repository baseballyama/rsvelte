import * as $ from 'svelte/internal/server';
import { Presentation, Slide, Code, Transition, Action } from '$lib/index.js';
import { tween } from '@animotion/motion';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text;
		let code;
		let circle = tween({ x: 0, y: 80, r: 80, fill: '#00ffff' });
		let items = [1, 2, 3, 4];
		let layout = 'flex gap-4';

		Presentation($$renderer, {
			options: {
				history: true,
				transition: 'slide',
				controls: true,
				progress: true
			},

			children: ($$renderer) => {
				Slide($$renderer, {
					class: 'h-full place-content-center place-items-center',
					children: ($$renderer) => {
						$$renderer.push(`<p class="text-4xl font-bold drop-shadow-sm">🪄 Use arrow keys to navigate</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Slide($$renderer, {
					class: 'h-full place-content-center place-items-center',
					children: ($$renderer) => {
						Transition($$renderer, {
							do: async () => {
								text.classList.replace('text-6xl', 'text-8xl');
								await code.update``;
							},

							children: ($$renderer) => {
								$$renderer.push(`<p class="text-8xl font-bold drop-shadow-sm">🪄 Animotion</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Transition($$renderer, {
							do: async () => {
								text.classList.replace('text-8xl', 'text-6xl');

								await code.update`
					async function animate() {
						// ...
					}
				`;

								await circle.to({ x: 0, fill: '#00ffff' });
							},
							class: 'mt-16 rounded-lg border-t border-t-zinc-800 bg-zinc-900 px-8 py-4',
							children: ($$renderer) => {
								Code($$renderer, {
									lang: 'ts',
									theme: 'poimandres',
									code: ``,
									options: { duration: 600, stagger: 0.3, containerStyle: false }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Transition($$renderer, {
							do: async () => {
								await code.update`
					async function animate() {
						// ...
					}
				`;

								await circle.to({ x: 0, fill: '#00ffff' });
							},
							class: 'mt-16',
							children: ($$renderer) => {
								$$renderer.push(`<svg width="560"${$.attr('height', circle.r * 2)}${$.attr('viewBox', `-80 0 560 ${$.stringify(circle.r * 2)}`)}><circle${$.attr('cx', circle.x)}${$.attr('cy', circle.y)}${$.attr('r', circle.r)}${$.attr('fill', circle.fill)}></circle><text${$.attr('x', circle.x)}${$.attr('y', circle.y)}${$.attr('font-size', circle.r * 0.4)} font-family="Monaspace Neon" text-anchor="middle" dominant-baseline="middle">${$.escape(circle.x.toFixed(0))}</text></svg>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Action($$renderer, {
							actions: [
								async () => {
									await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' });
						}
					`;

									await code.selectLines`2`;
									await circle.to({ x: 400, fill: '#ffff00' });
								},

								async () => {
									await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' });
							await circle.to({ x: 0, fill: '#00ffff' });
						}
					`;

									await code.selectLines`3`;
									await circle.to({ x: 0, fill: '#00ffff' });
								},

								async () => {
									await code.selectLines`*`;

									await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' });
							await circle.to({ x: 0, fill: '#00ffff' });
						}
					`;

									await circle.to({ x: 0, fill: '#00ffff' });
								}
							]
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Slide($$renderer, {
					class: 'h-full place-content-center place-items-center',
					children: ($$renderer) => {
						Transition($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<p class="text-6xl font-bold drop-shadow-sm">🪄 Layout Animations</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Transition($$renderer, {
							do: () => {
								items = [1, 2, 3, 4];
								layout = 'flex gap-4';
							},
							class: 'mt-16',
							children: ($$renderer) => {
								$$renderer.push(`<div${$.attr_class($.clsx(layout))}><!--[-->`);

								const each_array = $.ensure_array_like(items);

								for (let i = 0, $$length = each_array.length; i < $$length; i++) {
									let item = each_array[i];

									Transition($$renderer, {
										class: 'grid h-45 w-45 place-content-center rounded-2xl border-t-2 border-white bg-gray-200 text-6xl font-semibold text-black shadow-2xl',
										entry: 'rotate',
										duration: 2,
										delay: i * 0.1,
										visible: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item)}`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]--></div>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Transition($$renderer, {
							transitions: [
								() => {
									layout = 'grid grid-cols-2 grid-rows-2 gap-4';
									items = [4, 3, 2, 1];
								},

								() => {
									layout = 'grid grid-cols-2 grid-rows-2 gap-4';
									items = [2, 1, 4, 3];
								},

								() => {
									layout = 'grid grid-cols-2 grid-rows-2 gap-4';
									items = [4, 3, 2, 1];
								},

								() => {
									layout = 'grid grid-cols-2 grid-rows-2 gap-4';
									items = [1, 2, 3, 4];
								},
								() => layout = 'flex gap-4'
							]
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Slide($$renderer, {
					class: 'h-full place-content-center place-items-center',
					children: ($$renderer) => {
						$$renderer.push(`<p class="mt-8 text-6xl font-bold">🪄 Animotion</p> <p class="mt-16 text-3xl">Learn more by reading the <a class="underline" href="https://animotion.pages.dev/docs" target="_blank">Animotion docs</a>.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}