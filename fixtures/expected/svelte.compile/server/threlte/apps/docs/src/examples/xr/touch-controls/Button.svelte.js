import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Spring } from 'svelte/motion';
import { Mesh } from 'three';

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let hovering = { left: false, right: false };
		let pressed = { left: false, right: false };
		const isHovered = $.derived(() => hovering.left || hovering.right);
		const isPressed = $.derived(() => pressed.left || pressed.right);
		let { color, $$slots, $$events, ...rest } = $$props;
		const pressDepth = 0.03;
		const press = new Spring(0);
		const mesh = new Mesh();

		T($$renderer, $.spread_props([
			{
				is: mesh,
				onpointerenter: (event) => {
					hovering[event.handedness] = true;
				},

				onpointerleave: (event) => {
					hovering[event.handedness] = false;
				},

				onpointerdown: (event) => {
					pressed[event.handedness] = true;
					press.set(1);
				},

				onpointerup: (event) => {
					pressed[event.handedness] = false;

					if (!isPressed()) press.set(0);
				}
			},
			rest,
			{
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [0.08, 0.08, 0.04] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshStandardMaterial($$renderer, {
							color,
							emissive: color,
							emissiveIntensity: isHovered() ? 0.4 : 0.1
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			}
		]));
	});
}