import * as $ from 'svelte/internal/server';
import { BoxGeometry, MeshStandardMaterial } from 'three';
import { T, useTask } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rotation = 0;

		useTask((delta) => {
			rotation += delta;
		});

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { 'position.y': 10, 'position.z': 10 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				rotation: [rotation, rotation, rotation],
				geometry: new BoxGeometry(2, 2, 2),
				material: new MeshStandardMaterial()
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}