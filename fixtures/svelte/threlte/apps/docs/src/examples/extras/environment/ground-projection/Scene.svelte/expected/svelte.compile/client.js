import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Environment, OrbitControls, Suspense } from '@threlte/extras';
import { GroundedSkybox } from 'three/examples/jsm/Addons.js';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let useGround = $.prop($$props, 'useGround', 3, true);
	let skybox = $.state(void 0);
	const groundOptions = { height: 15, radius: 100 };
	const ground = $.derived(() => useGround() === false ? useGround() : groundOptions);
	const radius = 0.5;
	const y = groundOptions.height - radius - 0.1;

	$.user_effect(() => {
		$.get(skybox)?.position.setY(y);
	});

	Suspense($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					'position.x': 5,
					'position.y': 2,
					'position.z': 5,
					children: ($$anchor, $$slotProps) => {
						OrbitControls($$anchor, {
							maxDistance: 20,
							maxPolarAngle: 0.5 * Math.PI,
							enableDamping: true,
							enableZoom: false
						});
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					'rotation.x': 0.5 * Math.PI,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_2 = $.first_child(fragment_3);

						$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, { metalness: 1 });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => T.TorusGeometry, ($$anchor, T_TorusGeometry) => {
							T_TorusGeometry($$anchor, { args: [2, radius] });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_4 = $.sibling(node_1, 2);

			Environment(node_4, {
				isBackground: true,
				url: '/textures/equirectangular/hdr/blouberg_sunrise_2_1k.hdr',
				get ground() {
					return $.get(ground);
				},

				get skybox() {
					return $.get(skybox);
				},

				set skybox($$value) {
					$.set(skybox, $$value);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}