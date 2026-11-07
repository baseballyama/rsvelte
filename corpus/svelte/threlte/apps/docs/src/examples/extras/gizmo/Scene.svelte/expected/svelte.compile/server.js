import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Grid } from '@threlte/extras';
import { BufferAttribute } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { center } = $$props;
		const red = [1, 0, 0];
		const green = [0, 1, 0];
		const blue = [0, 0, 1];

		const colors = new Float32Array([
			...red,
			...red,
			...red,
			...red,
			...red,
			...red,
			...red,
			...red,
			...green,
			...green,
			...green,
			...green,
			...green,
			...green,
			...green,
			...green,
			...blue,
			...blue,
			...blue,
			...blue,
			...blue,
			...blue,
			...blue,
			...blue
		]);

		if (T.AxesHelper) {
			$$renderer.push('<!--[-->');
			T.AxesHelper($$renderer, { args: [5], renderOrder: 1 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Grid($$renderer, { sectionSize: 0, cellColor: '#eee' });
		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				position: center,
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');

						T.BoxGeometry($$renderer, {
							oncreate: (ref) => {
								ref.setAttribute('color', new BufferAttribute(colors, 3));
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, { vertexColors: true });
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
	});
}