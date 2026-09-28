import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

export default function Scene($$renderer) {
	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			children: ($$renderer) => {
				if (T.BoxGeometry) {
					$$renderer.push('<!--[-->');
					T.BoxGeometry($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshBasicMaterial($$renderer, {});
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