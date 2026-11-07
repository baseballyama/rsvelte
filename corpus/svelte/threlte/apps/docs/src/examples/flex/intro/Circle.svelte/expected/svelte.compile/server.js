import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Circle($$renderer, $$props) {
	let { color = 'white', radius = 5, z = 0 } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			'position.z': z,
			children: ($$renderer) => {
				if (T.CircleGeometry) {
					$$renderer.push('<!--[-->');
					T.CircleGeometry($$renderer, { args: [radius] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, { color });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}