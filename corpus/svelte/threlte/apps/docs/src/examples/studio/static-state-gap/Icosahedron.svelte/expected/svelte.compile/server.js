import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Icosahedron($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, $.spread_props([
			props,
			{
				children: ($$renderer) => {
					if (T.IcosahedronGeometry) {
						$$renderer.push('<!--[-->');
						T.IcosahedronGeometry($$renderer, {});
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