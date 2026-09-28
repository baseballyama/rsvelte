import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Align, OrbitControls } from '@threlte/extras';
import { BufferGeometry, Vector3 } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function SceneAlternative($$anchor, $$props) {
	$.push($$props, true);

	const size = 30;
	const count = size ** 3;
	const vectorPositions = [];

	// 3D math squiggles
	for (let i = 0; i < count; i++) {
		// 1D to 3D array
		let x = i / (size * size);

		let y = i / size % size;
		let z = i % size;
		const vx = Math.sin(Math.abs(size - x) * 0.1) * Math.sin(Math.abs(size - y) * 0.1) * 10 + Math.random() * 0.1;
		const vy = Math.sin(Math.abs(size - x) * 0.3) * Math.sin(Math.abs(size - y) * 0.3) * 10 + Math.random() * 0.1;
		const vz = y + Math.random() * 0.01 * z;

		vectorPositions.push(new Vector3(vx, vy, vz));
	}

	const pointsBufferGeometry = new BufferGeometry().setFromPoints(vectorPositions);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [50, 50, 50],
			fov: 15,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { autoRotate: true });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.z': 10 });
	});

	var node_2 = $.sibling(node_1, 2);

	Align(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.component(node_3, () => T.Points, ($$anchor, T_Points) => {
				T_Points($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_4 = $.first_child(fragment_3);

						T(node_4, {
							get is() {
								return pointsBufferGeometry;
							}
						});

						var node_5 = $.sibling(node_4, 2);

						$.component(node_5, () => T.PointsMaterial, ($$anchor, T_PointsMaterial) => {
							T_PointsMaterial($$anchor, { size: 0.25 });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}