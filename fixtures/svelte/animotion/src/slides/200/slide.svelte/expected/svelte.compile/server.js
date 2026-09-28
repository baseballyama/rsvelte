import * as $ from 'svelte/internal/server';
import { Code, Transition, Action } from '$lib/index.js';
import { tween } from '@animotion/motion';

export default function Slide($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let text;
		let code;
		let circle = tween({ x: 0, y: 80, r: 80, fill: '#00ffff' });

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
			class: 'mt-16',
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
							await circle.to({ x: 400, fill: '#ffff00' })
						}
					`;

					await code.selectLines`2`;
					await circle.to({ x: 400, fill: '#ffff00' });
				},

				async () => {
					await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' })
							await circle.to({ x: 0, fill: '#00ffff' })
						}
					`;

					await code.selectLines`3`;
					await circle.to({ x: 0, fill: '#00ffff' });
				},

				async () => {
					await code.selectLines`*`;

					await code.update`
						async function animate() {
							await circle.to({ x: 400, fill: '#ffff00' })
							await circle.to({ x: 0, fill: '#00ffff' })
						}
					`;

					await circle.to({ x: 0, fill: '#00ffff' });
				}
			]
		});

		$$renderer.push(`<!---->`);
	});
}