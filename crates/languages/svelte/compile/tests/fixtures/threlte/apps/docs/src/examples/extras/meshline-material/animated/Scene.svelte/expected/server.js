import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';

import {
	MeshLineMaterial,
	MeshLineGeometry,
	Grid,
	OrbitControls,
	useTexture
} from '@threlte/extras';

import { Vector3, CatmullRomCurve3, Color } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			width = 0.5,
			opacity = 1,
			dashArray = 0.5,
			dashRatio = 0.5,
			attenuate = true,
			scaleDown = 0
		} = $$props;

		// create a smooth curve from 4 points
		const curve = new CatmullRomCurve3([
			new Vector3(-3, 0, 0),
			new Vector3(-1, 1, -1),
			new Vector3(1, -1, 1),
			new Vector3(3, 0, 0)
		]);

		// convert curve to an array of 100 points
		const points = curve.getPoints(100);

		let dashOffset = 0;
		let color = '#fe3d00';
		const orange = new Color('#fe3d00');
		const purple = new Color('#9800fe');
		const c = new Color();

		c.lerpColors(orange, purple, 0.5);

		useTask((delta) => {
			// every frame we:
			// increase the dash offset
			dashOffset += delta / 2;

			// transition between two colors
			color = `#${c.lerpColors(orange, purple, Math.sin(dashOffset * 2) / 2 + 0.5).getHexString()}`;

			// shrink and grow the line width
			width = Math.sin(dashOffset * 2) / 5 + 0.3;
		});

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.y': 3,
				scale: 2,
				children: ($$renderer) => {
					MeshLineGeometry($$renderer, { points });
					$$renderer.push(`<!----> `);

					MeshLineMaterial($$renderer, {
						width,
						color,
						opacity,
						dashArray,
						dashRatio,
						dashOffset,
						attenuate,
						scaleDown,
						transparent: true,
						depthTest: false
					});

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