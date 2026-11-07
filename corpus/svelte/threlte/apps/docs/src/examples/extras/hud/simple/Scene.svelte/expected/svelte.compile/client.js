import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask, useThrelte } from '@threlte/core';
import { Float, OrbitControls, HUD } from '@threlte/extras';
import { Quaternion } from 'three';
import HudScene from './HudScene.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let selected = $.state('box');
	let rotation = $.state(0);
	const quaternion = new Quaternion();
	const { camera } = useThrelte();

	useTask(
		(delta) => {
			$.set(rotation, $.get(rotation) + delta);

			// Spin mesh to the inverse of the default cameras matrix
			quaternion.copy(camera.current.quaternion).invert();
		},
		{ autoInvalidate: false }
	);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [11, 5, 11],
			makeDefault: true,
			fov: 30,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [0, 10, 10] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.6 });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [5] });
	});

	var node_4 = $.sibling(node_3, 2);

	HUD(node_4, {
		children: ($$anchor, $$slotProps) => {
			HudScene($$anchor, {
				get quaternion() {
					return quaternion;
				},

				onselect: (arg) => {
					$.set(selected, arg, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Float(node_5, {
		speed: 8,
		get 'rotation.y'() {
			return $.get(rotation);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			{
				var consequent = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_7 = $.first_child(fragment_4);

					$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							'position.y': 0.8,
							scale: 2,
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_8 = $.first_child(fragment_5);

								$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
									T_BoxGeometry($$anchor, { args: [0.5, 0.5, 0.5] });
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial) => {
									T_MeshToonMaterial($$anchor, { color: 'turquoise' });
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_4);
				};

				var consequent_1 = ($$anchor) => {
					var fragment_6 = $.comment();
					var node_10 = $.first_child(fragment_6);

					$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							'position.y': 0.8,
							scale: 1.8,
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_11 = $.first_child(fragment_7);

								$.component(node_11, () => T.TorusGeometry, ($$anchor, T_TorusGeometry) => {
									T_TorusGeometry($$anchor, { args: [0.25, 0.1] });
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial_1) => {
									T_MeshToonMaterial_1($$anchor, { color: 'turquoise' });
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_6);
				};

				var consequent_2 = ($$anchor) => {
					var fragment_8 = $.comment();
					var node_13 = $.first_child(fragment_8);

					$.component(node_13, () => T.Mesh, ($$anchor, T_Mesh_2) => {
						T_Mesh_2($$anchor, {
							'position.y': 0.8,
							scale: 1.8,
							children: ($$anchor, $$slotProps) => {
								var fragment_9 = root();
								var node_14 = $.first_child(fragment_9);

								$.component(node_14, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
									T_TorusKnotGeometry($$anchor, { args: [0.215, 0.08, 256] });
								});

								var node_15 = $.sibling(node_14, 2);

								$.component(node_15, () => T.MeshToonMaterial, ($$anchor, T_MeshToonMaterial_2) => {
									T_MeshToonMaterial_2($$anchor, { color: 'turquoise' });
								});

								$.append($$anchor, fragment_9);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				};

				$.if(node_6, ($$render) => {
					if ($.get(selected) === 'box') $$render(consequent); else if ($.get(selected) === 'torus') $$render(consequent_1, 1); else if ($.get(selected) === 'torusknot') $$render(consequent_2, 2);
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}