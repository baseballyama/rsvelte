import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useGltf, PointsMaterial, OrbitControls, Grid } from '@threlte/extras';
import { Vector3 } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const gltf = useGltf('/models/pointcloud_plant_in_a_pot.glb');

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [1, 1, 2],
				children: ($$renderer) => {
					OrbitControls($$renderer, { autoRotate: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.await($$renderer, gltf, () => {}, (result) => {
			if (T.Points) {
				$$renderer.push('<!--[-->');

				T.Points($$renderer, {
					'rotation.x': -Math.PI / 2,
					children: ($$renderer) => {
						T($$renderer, { is: result.nodes.Object_2.geometry });
						$$renderer.push(`<!----> `);
						PointsMaterial($$renderer, { size: 0.05, vertexColors: true, toneMapped: false });
						$$renderer.push(`<!---->`);
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

		Grid($$renderer, {
			'position.y': -0.5,
			infiniteGrid: true,
			cellColor: '#fff',
			sectionColor: '#fff',
			cellSize: 0.25,
			fadeDistance: 2,
			type: 'circular',
			fadeOrigin: new Vector3()
		});

		$$renderer.push(`<!---->`);
	});
}