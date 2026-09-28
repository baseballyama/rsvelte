import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Environment, OrbitControls } from '@threlte/extras';
import { DoubleSide, PlaneGeometry } from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let autoRotate = $.prop($$props, 'autoRotate', 3, false),
		flatness = $.prop($$props, 'flatness', 3, 4);

	const geometry = new PlaneGeometry(10, 10, 100, 100);
	const positions = geometry.getAttribute('position');
	const noise = new SimplexNoise();

	$.user_effect(() => {
		for (let i = 0; i < positions.count; i += 1) {
			const x = positions.getX(i) / flatness();
			const y = positions.getY(i) / flatness();

			positions.setZ(i, noise.noise(x, y));
		}

		positions.needsUpdate = true;

		// needed for lighting
		geometry.computeVertexNormals();
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: 10,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					get autoRotate() {
						return autoRotate();
					},
					autoRotateSpeed: 0.5
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Environment(node_1, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get geometry() {
				return geometry;
			},
			'rotation.x': -1 * 0.5 * Math.PI,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node_3 = $.first_child(fragment_2);

				$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						get side() {
							return DoubleSide;
						}
					});
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}