import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { RoundedBoxGeometry } from '@threlte/extras';

export default function Box($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, $.spread_props([
			props,
			{
				children: ($$renderer) => {
					RoundedBoxGeometry($$renderer, { radius: 0.2, args: [1.3, 1.3, 1.3] });
					$$renderer.push(`<!----> `);

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