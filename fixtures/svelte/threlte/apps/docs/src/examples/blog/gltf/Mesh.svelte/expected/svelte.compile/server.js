import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { BufferGeometry, DoubleSide, Texture } from 'three';

export default function Mesh($$renderer, $$props) {
	let { geometry, texture, visible, wireframe } = $$props;

	if (T.Mesh) {
		$$renderer.push('<!--[-->');

		T.Mesh($$renderer, {
			geometry,
			visible,
			children: ($$renderer) => {
				if (T.MeshBasicMaterial) {
					$$renderer.push('<!--[-->');

					T.MeshBasicMaterial($$renderer, {
						wireframe,
						side: DoubleSide,
						children: ($$renderer) => {
							T($$renderer, { is: texture, attach: 'map', flipY: false });
						},
						$$slots: { default: true }
					});

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