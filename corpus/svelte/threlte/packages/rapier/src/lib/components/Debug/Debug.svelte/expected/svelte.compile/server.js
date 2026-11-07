import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { BufferAttribute, BufferGeometry, LineSegments } from 'three';
import { useRapier } from '../../hooks/useRapier.js';

export default function Debug($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = new LineSegments(), $$slots, $$events, ...props } = $$props;
		const { world, debug } = useRapier();
		const geometry = new BufferGeometry();
		let positionAttribute = new BufferAttribute(new Float32Array(0), 3);
		let colorAttribute = new BufferAttribute(new Float32Array(0), 4);

		geometry.setAttribute('position', positionAttribute);
		geometry.setAttribute('color', colorAttribute);

		useTask(() => {
			const { vertices, colors } = world.debugRender();

			if (positionAttribute.array.length === vertices.length) {
				positionAttribute.array.set(vertices);
				colorAttribute.array.set(colors);
				positionAttribute.needsUpdate = true;
				colorAttribute.needsUpdate = true;
			} else {
				// rapier returns matched vertex/color counts, so they always resize together
				geometry.dispose();

				positionAttribute = new BufferAttribute(vertices, 3);
				colorAttribute = new BufferAttribute(colors, 4);
				geometry.setAttribute('position', positionAttribute);
				geometry.setAttribute('color', colorAttribute);
			}
		});

		T($$renderer, $.spread_props([
			{ is: ref, frustumCulled: false, renderOrder: Infinity },
			props,
			{
				children: ($$renderer) => {
					T($$renderer, { is: geometry });
					$$renderer.push(`<!----> `);

					if (T.LineBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.LineBasicMaterial($$renderer, { vertexColors: true });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			}
		]));

		$.bind_props($$props, { ref });
	});
}