import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Sparkles } from '@threlte/extras';

export default function Sphere($$renderer, $$props) {
	let {
		size = 1,
		count = 100,
		color = 'white',
		emissive = 'white',
		$$slots,
		$$events,
		...rest
	} = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, $.spread_props([
			rest,
			{
				children: ($$renderer) => {
					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, { args: [size, 64, 64] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');

						T.MeshStandardMaterial($$renderer, {
							roughness: 0,
							metalness: 0.1,
							color,
							emissive: emissive || color,
							envMapIntensity: 0.2
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Sparkles($$renderer, { count, scale: size * 2, size: 6, speed: 0.4, color: 'white' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}