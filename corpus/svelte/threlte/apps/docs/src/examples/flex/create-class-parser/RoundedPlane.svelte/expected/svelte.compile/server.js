import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Shape, ShapeGeometry } from 'three';

export default function RoundedPlane($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			color = 'white',
			height = 1,
			width = 1,
			radius = 5,
			depth = 0
		} = $$props;

		let x = 1;
		let y = 1;

		const createGeometry = (width, height, radius) => {
			let shape = new Shape();

			shape.moveTo(x, y + radius);
			shape.lineTo(x, y + height - radius);
			shape.quadraticCurveTo(x, y + height, x + radius, y + height);
			shape.lineTo(x + width - radius, y + height);
			shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
			shape.lineTo(x + width, y + radius);
			shape.quadraticCurveTo(x + width, y, x + width - radius, y);
			shape.lineTo(x + radius, y);
			shape.quadraticCurveTo(x, y, x, y + radius);

			const geometry = new ShapeGeometry(shape);

			geometry.center();

			return geometry;
		};

		let geometry = $.derived(() => createGeometry(width, height, radius));

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.z': depth * 20,
				renderOrder: depth,
				children: ($$renderer) => {
					T($$renderer, { is: geometry() });
					$$renderer.push(`<!----> `);

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
	});
}