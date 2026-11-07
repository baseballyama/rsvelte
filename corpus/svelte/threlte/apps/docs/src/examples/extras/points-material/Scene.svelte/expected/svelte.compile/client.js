import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useGltf, PointsMaterial, OrbitControls, Grid } from '@threlte/extras';
import { Vector3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const gltf = useGltf('/models/pointcloud_plant_in_a_pot.glb');
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [1, 1, 2],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotate: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.await(node_1, () => gltf, null, ($$anchor, result) => {
		var fragment_2 = $.comment();
		var node_2 = $.first_child(fragment_2);

		$.component(node_2, () => T.Points, ($$anchor, T_Points) => {
			T_Points($$anchor, {
				'rotation.x': -Math.PI / 2,
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_3 = $.first_child(fragment_3);

					T(node_3, {
						get is() {
							return $.get(result).nodes.Object_2.geometry;
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PointsMaterial(node_4, { size: 0.05, vertexColors: true, toneMapped: false });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_2);
	});

	var node_5 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => new Vector3());

		Grid(node_5, {
			'position.y': -0.5,
			infiniteGrid: true,
			cellColor: '#fff',
			sectionColor: '#fff',
			cellSize: 0.25,
			fadeDistance: 2,
			type: 'circular',
			get fadeOrigin() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}