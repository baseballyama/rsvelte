import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { ContactShadows, Environment, Float, OrbitControls } from '@threlte/extras';

import {
	BoxGeometry,
	Color,
	IcosahedronGeometry,
	MeshStandardMaterial,
	TorusKnotGeometry
} from 'three';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [-10, 10, 10],
			fov: 25,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enabled: false,
					autoRotate: true,
					autoRotateSpeed: 0.5,
					'target.y': 1
				});
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { intensity: 0.8, 'position.x': 5, 'position.y': 10 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [10, 10], 'position.y': -0.001 });
	});

	var node_5 = $.sibling(node_4, 2);

	ContactShadows(node_5, { frames: 200, scale: 10, blur: 2, far: 2.5, opacity: 0.5 });

	var node_6 = $.sibling(node_5, 2);

	Float(node_6, {
		floatIntensity: 1,
		floatingRange: [0, 1],
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_7 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => new BoxGeometry(1, 1, 1));
				let $1 = $.derived(() => new MeshStandardMaterial({ color: new Color('#0059BA') }));

				$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						'position.y': 1.2,
						'position.z': -0.75,
						get geometry() {
							return $.get($0);
						},

						get material() {
							return $.get($1);
						}
					});
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 2);

	Float(node_8, {
		floatIntensity: 1,
		floatingRange: [0, 1],
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_9 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => new TorusKnotGeometry(0.5, 0.15, 100, 12, 2, 3));
				let $1 = $.derived(() => new MeshStandardMaterial({ color: new Color('#F85122') }));

				$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						position: [1.2, 1.5, 0.75],
						'rotation.x': 5,
						'rotation.y': 71,
						get geometry() {
							return $.get($0);
						},

						get material() {
							return $.get($1);
						}
					});
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 2);

	Float(node_10, {
		floatIntensity: 1,
		floatingRange: [0, 1],
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = $.comment();
			var node_11 = $.first_child(fragment_4);

			{
				let $0 = $.derived(() => new IcosahedronGeometry(1, 0));
				let $1 = $.derived(() => new MeshStandardMaterial({ color: new Color('#F8EBCE') }));

				$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_2) => {
					T_Mesh_2($$anchor, {
						position: [-1.4, 1.5, 0.75],
						rotation: [-5, 128, 10],
						get geometry() {
							return $.get($0);
						},

						get material() {
							return $.get($1);
						}
					});
				});
			}

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}