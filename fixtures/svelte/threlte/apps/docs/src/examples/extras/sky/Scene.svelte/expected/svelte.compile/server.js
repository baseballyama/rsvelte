import * as $ from 'svelte/internal/server';
import { DEG2RAD } from 'three/src/math/MathUtils.js';
import { Grid, OrbitControls } from '@threlte/extras';
import { SphereGeometry } from 'three';
import { T, useThrelte } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { exposure = 1 } = $$props;
		const { renderer, invalidate } = useThrelte();
		const sphereGeo = new SphereGeometry(2.5, 32, 32);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				position: [0, 7, 18],
				fov: 60,
				near: 1,
				far: 20000,
				makeDefault: true,
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						maxPolarAngle: 85 * DEG2RAD,
						enableDamping: true,
						target: [0, 2.5, 0]
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				castShadow: true,
				'position.x': 3,
				'position.y': 2.5,
				children: ($$renderer) => {
					T($$renderer, { is: sphereGeo });
					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { roughness: 0.1, metalness: 1 });
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

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				castShadow: true,
				'position.x': -3,
				'position.y': 2.5,
				children: ($$renderer) => {
					T($$renderer, { is: sphereGeo });
					$$renderer.push(`<!----> `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, {});
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

		$$renderer.push(` `);
		Grid($$renderer, { cellColor: 'white', sectionColor: 'white' });
		$$renderer.push(`<!---->`);
	});
}