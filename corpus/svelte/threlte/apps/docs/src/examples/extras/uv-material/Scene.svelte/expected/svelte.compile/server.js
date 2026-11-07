import * as $ from 'svelte/internal/server';
import { Align, Grid, OrbitControls, UvMaterial } from '@threlte/extras';
import { T } from '@threlte/core';

import {
	BoxGeometry,
	CapsuleGeometry,
	CircleGeometry,
	ConeGeometry,
	CylinderGeometry,
	DodecahedronGeometry,
	ExtrudeGeometry,
	IcosahedronGeometry,
	LatheGeometry,
	OctahedronGeometry,
	PerspectiveCamera,
	RingGeometry,
	ShapeGeometry,
	SphereGeometry,
	TetrahedronGeometry,
	TorusGeometry,
	TorusKnotGeometry,
	Vector3
} from 'three';

const cameraAxis = new Vector3(0.75, 0.5, 1).normalize();

const geometries = [
	BoxGeometry,
	CapsuleGeometry,
	CircleGeometry,
	ConeGeometry,
	CylinderGeometry,
	DodecahedronGeometry,
	ExtrudeGeometry,
	IcosahedronGeometry,
	LatheGeometry,
	OctahedronGeometry,
	RingGeometry,
	ShapeGeometry,
	SphereGeometry,
	TetrahedronGeometry,
	TorusGeometry,
	TorusKnotGeometry
].map((constructor) => new constructor());

const width = 4;
const gap = 4;
const cameraTranslationAmount = 5 * width;
const gridColor = '#ffffff';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const camera = new PerspectiveCamera();

		camera.translateOnAxis(cameraAxis, cameraTranslationAmount);

		T($$renderer, {
			is: camera,
			makeDefault: true,
			children: ($$renderer) => {
				OrbitControls($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Align($$renderer, {
			'position.y': 2,
			oncreate: (ref) => {
				camera.lookAt(ref.position);
			},

			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(geometries);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let geometry = each_array[i];

					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							'position.x': gap * (i % width),
							'position.z': gap * Math.floor(i / width),
							children: ($$renderer) => {
								T($$renderer, { is: geometry });
								$$renderer.push(`<!----> `);
								UvMaterial($$renderer, {});
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Grid($$renderer, {
			infiniteGrid: true,
			cellColor: gridColor,
			sectionColor: gridColor
		});

		$$renderer.push(`<!---->`);
	});
}