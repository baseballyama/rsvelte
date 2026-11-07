import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Plane($$renderer, $$props) {
	let { color = 'white', height = 1, width = 1, depth = 0 } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			'position.z': depth * 20,
			renderOrder: depth,
			children: ($$renderer) => {
				if (T.PlaneGeometry) {
					$$renderer.push('<!--[-->');
					T.PlaneGeometry($$renderer, { args: [width, height] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, { color, transparent: true, opacity: 0.5 });
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