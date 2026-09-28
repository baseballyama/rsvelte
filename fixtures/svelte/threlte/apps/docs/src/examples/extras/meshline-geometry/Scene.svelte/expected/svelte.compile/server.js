import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Grid, MeshLineGeometry, MeshLineMaterial, OrbitControls } from '@threlte/extras';
import { CatmullRomCurve3, Vector3 } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { shape = 'taper', color = '#fe3d00', width = 1 } = $$props;

		// create a smooth curve from 4 points
		const curve = new CatmullRomCurve3([
			new Vector3(-3, 0, 0),
			new Vector3(-1, 1, -1),
			new Vector3(1, -1, 1),
			new Vector3(3, 0, 0)
		]);

		// convert curve to an array of 100 points
		const points = curve.getPoints(100);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.y': 3,
				scale: 2,
				children: ($$renderer) => {
					MeshLineGeometry($$renderer, { points, shape });
					$$renderer.push(`<!----> `);
					MeshLineMaterial($$renderer, { color, width });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				oncreate: (ref) => {
					ref.position.set(10, 3, 10);
				},

				children: ($$renderer) => {
					OrbitControls($$renderer, {
						autoRotate: true,
						autoRotateSpeed: 2,
						enableDamping: true,
						enableZoom: false,
						'target.y': 2
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

		Grid($$renderer, {
			gridSize: [10, 10],
			cellColor: '#46536b',
			sectionThickness: 0
		});

		$$renderer.push(`<!---->`);
	});
}