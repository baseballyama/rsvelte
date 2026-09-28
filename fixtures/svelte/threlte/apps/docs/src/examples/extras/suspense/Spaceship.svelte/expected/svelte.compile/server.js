import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Float, useGltf, useSuspense } from '@threlte/extras';

export default function Spaceship($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, $$slots, $$events, ...rest } = $$props;
		const suspend = useSuspense();
		const gltf = suspend(useGltf(`/models/spaceships/${name}.gltf`));

		$.await($$renderer, gltf, () => {}, ({ scene }) => {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, $.spread_props([
					rest,
					{
						children: ($$renderer) => {
							Float($$renderer, {
								floatIntensity: 3,
								speed: 3,
								children: ($$renderer) => {
									T($$renderer, { is: scene });
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		});

		$$renderer.push(`<!--]-->`);
	});
}