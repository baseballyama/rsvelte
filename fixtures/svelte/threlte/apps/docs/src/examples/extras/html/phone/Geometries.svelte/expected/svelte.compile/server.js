import * as $ from 'svelte/internal/server';

import {
	MeshStandardMaterial,
	TetrahedronGeometry,
	CylinderGeometry,
	ConeGeometry,
	SphereGeometry,
	IcosahedronGeometry,
	TorusGeometry,
	OctahedronGeometry,
	BoxGeometry,
	MathUtils
} from 'three';

import { T } from '@threlte/core';
import { Float } from '@threlte/extras';

export default function Geometries($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const material = new MeshStandardMaterial();

		const geometries = [
			{ geometry: new TetrahedronGeometry(2) },
			{ geometry: new CylinderGeometry(0.8, 0.8, 2, 32) },
			{ geometry: new ConeGeometry(1.1, 1.7, 32) },
			{ geometry: new SphereGeometry(1.5, 32, 32) },
			{ geometry: new IcosahedronGeometry(2) },
			{ geometry: new TorusGeometry(1.1, 0.35, 16, 32) },
			{ geometry: new OctahedronGeometry(2) },
			{ geometry: new SphereGeometry(1.5, 32, 32) },
			{ geometry: new BoxGeometry(2.5, 2.5, 2.5) }
		];

		const n = 40;
		const randProps = Array.from({ length: n }, () => geometries[Math.floor(Math.random() * geometries.length)]);

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(randProps);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let prop = each_array[$$index];

			Float($$renderer, {
				floatIntensity: 0,
				rotationIntensity: 2,
				rotationSpeed: 2,
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							scale: MathUtils.randFloat(0.25, 0.5),
							position: [
								MathUtils.randFloat(-8, 8),
								MathUtils.randFloat(-8, 8),
								MathUtils.randFloat(-8, 8)
							],
							geometry: prop?.geometry,
							material
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}