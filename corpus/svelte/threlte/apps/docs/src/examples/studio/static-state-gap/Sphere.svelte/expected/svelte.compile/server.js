import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Sphere($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, $.spread_props([
			props,
			{
				children: ($$renderer) => {
					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, { args: [0.8] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#fe3d00' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
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