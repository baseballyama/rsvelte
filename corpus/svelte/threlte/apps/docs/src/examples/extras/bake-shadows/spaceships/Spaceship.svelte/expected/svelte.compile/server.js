import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useGltf, useSuspense } from '@threlte/extras';

export default function Spaceship($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { name, $$slots, $$events, ...props } = $$props;
		const suspend = useSuspense();
		let gltf = suspend(useGltf(`/models/spaceships/${name}.gltf`));

		$.await($$renderer, gltf, () => {}, ({ scene }) => {
			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, $.spread_props([
					props,
					{
						children: ($$renderer) => {
							T($$renderer, {
								is: scene,
								oncreate: (ref) => {
									for (const child of ref.children) {
										child.castShadow = true;
										child.receiveShadow = true;
									}
								}
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