import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Float, OrbitControls, ShadowAlpha } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [4, 4, 4],
			fov: 35,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					autoRotate: true,
					autoRotateSpeed: 0.5,
					enableDamping: true,
					'target.y': 0.8
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			castShadow: true,
			intensity: 2,
			position: [3, 6, 3],
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.camera.left': -4,
			'shadow.camera.right': 4,
			'shadow.camera.top': 4,
			'shadow.camera.bottom': -4
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.4 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			receiveShadow: true,
			'rotation.x': -Math.PI / 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_4 = $.first_child(fragment_2);

				$.component(node_4, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, { args: [10, 10] });
				});

				var node_5 = $.sibling(node_4, 2);

				$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#f0ebe3' });
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_6 = $.sibling(node_3, 2);

	Float(node_6, {
		floatIntensity: 0.5,
		floatingRange: [0, 0.3],
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_7 = $.first_child(fragment_3);

			$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					castShadow: true,
					'position.y': 1.2,
					rotation: [0.4, 0.6, 0],
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_8 = $.first_child(fragment_4);

						$.component(node_8, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
							T_TorusKnotGeometry($$anchor, { args: [0.6, 0.2, 128, 32] });
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, {
								color: '#6c5ce7',
								transparent: true,
								get opacity() {
									return $$props.meshOpacity;
								}
							});
						});

						var node_10 = $.sibling(node_9, 2);

						ShadowAlpha(node_10, {
							get opacity() {
								return $$props.shadowOpacity;
							}
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}