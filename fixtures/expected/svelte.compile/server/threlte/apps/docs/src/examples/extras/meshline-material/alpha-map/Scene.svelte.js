import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

import {
	Grid,
	MeshLineGeometry,
	MeshLineMaterial,
	OrbitControls,
	useTexture
} from '@threlte/extras';

import { CubicBezierCurve3, DoubleSide, Vector3 } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const texture = useTexture('/brush-texture.png');

		// create a smooth bezier curve
		const curve = new CubicBezierCurve3(new Vector3(-5, 0, 0), new Vector3(-5, 7, 0), new Vector3(5, 7, 0), new Vector3(5, 0, 0));

		// convert curve to an array of 100 points
		const points = curve.getPoints(100);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'rotation.z': -0.1,
				children: ($$renderer) => {
					MeshLineGeometry($$renderer, { points });
					$$renderer.push(`<!----> `);

					$.await($$renderer, texture, () => {}, (alphaMap) => {
						MeshLineMaterial($$renderer, {
							width: 1,
							color: '#fe3d00',
							transparent: true,
							depthTest: false,
							alphaMap
						});
					});

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.await($$renderer, texture, () => {}, (map) => {
			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'position.y': 2,
					scale: 2,
					children: ($$renderer) => {
						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshBasicMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshBasicMaterial($$renderer, { map, side: DoubleSide });
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

		$$renderer.push(`<!--]--> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				oncreate: (ref) => {
					ref.position.set(0, 3, 10);
				},

				children: ($$renderer) => {
					OrbitControls($$renderer, { autoRotateSpeed: 2, enableDamping: true, 'target.y': 2 });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Grid($$renderer, {
			gridSize: [10, 10],
			cellColor: '#46536b',
			sectionThickness: 0
		});

		$$renderer.push(`<!---->`);
	});
}