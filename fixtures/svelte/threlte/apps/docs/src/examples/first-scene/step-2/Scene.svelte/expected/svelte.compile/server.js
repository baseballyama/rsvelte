import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Scene($$renderer) {
	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			position: [0, 1, 0],
			children: ($$renderer) => {
				if (T.BoxGeometry) {
					$$renderer.push('<!--[-->');
					T.BoxGeometry($$renderer, { args: [1, 2, 1] });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, { color: 'hotpink' });
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