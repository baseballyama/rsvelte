import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

export default function Geometries($$anchor, $$props) {
	$.push($$props, true);

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
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => randProps, $.index, ($$anchor, prop) => {
		Float($$anchor, {
			floatIntensity: 0,
			rotationIntensity: 2,
			rotationSpeed: 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => MathUtils.randFloat(0.25, 0.5));

					let $1 = $.derived(() => [
						MathUtils.randFloat(-8, 8),
						MathUtils.randFloat(-8, 8),
						MathUtils.randFloat(-8, 8)
					]);

					let $2 = $.derived(() => $.get(prop)?.geometry);

					$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							get scale() {
								return $.get($0);
							},

							get position() {
								return $.get($1);
							},

							get geometry() {
								return $.get($2);
							},

							get material() {
								return material;
							}
						});
					});
				}

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}