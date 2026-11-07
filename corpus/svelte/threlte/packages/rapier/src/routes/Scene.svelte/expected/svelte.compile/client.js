import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { RigidBody, AutoColliders, useRapier } from '$lib/index.js';
import { DEG2RAD } from 'three/src/math/MathUtils.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $paused = () => $.store_get(paused, '$paused', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { renderer } = useThrelte();
	const { resume, pause, paused } = useRapier();
	let sleepingObjects = $.state(0);

	$.user_effect(() => {
		if ($.get(sleepingObjects) === 2) {
			$$props.sleeping(renderer.getContext());
		}
	});

	var fragment = root_1();

	$.event('keydown', $.window, (e) => {
		if (e.key === 'p') {
			if ($paused()) {
				resume();

				window.requestAnimationFrame(() => {
					pause();
				});
			} else {
				pause();
			}
		}
	});

	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [3, 3, 3],
			oncreate: (ref) => ref.lookAt(0, 0, 0)
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, 0, -0.2],
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'dynamic',
					linearDamping: 1,
					angularDamping: 1,
					onsleep: () => $.update(sleepingObjects),
					children: ($$anchor, $$slotProps) => {
						AutoColliders($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										castShadow: true,
										receiveShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, { color: 'hotpink' });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, {});
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
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => 20 * DEG2RAD);

		$.component(node_5, () => T.Group, ($$anchor, T_Group_1) => {
			T_Group_1($$anchor, {
				position: [0, 2, 0.3],
				get 'rotation.y'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					RigidBody($$anchor, {
						type: 'dynamic',
						linearDamping: 1,
						angularDamping: 1,
						onsleep: () => $.update(sleepingObjects),
						children: ($$anchor, $$slotProps) => {
							AutoColliders($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = $.comment();
									var node_6 = $.first_child(fragment_7);

									$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
										T_Mesh_1($$anchor, {
											castShadow: true,
											receiveShadow: true,
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_7 = $.first_child(fragment_8);

												$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
													T_MeshStandardMaterial_1($$anchor, { color: 'hotpink' });
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
													T_BoxGeometry_1($$anchor, {});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		});
	}

	var node_9 = $.sibling(node_5, 2);

	AutoColliders(node_9, {
		shape: 'cuboid',
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = $.comment();
			var node_10 = $.first_child(fragment_9);

			$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_2) => {
				T_Mesh_2($$anchor, {
					receiveShadow: true,
					'position.y': -1,
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = root();
						var node_11 = $.first_child(fragment_10);

						$.component(node_11, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
							T_MeshStandardMaterial_2($$anchor, { color: 'turquoise' });
						});

						var node_12 = $.sibling(node_11, 2);

						$.component(node_12, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
							T_BoxGeometry_2($$anchor, { args: [4, 0.1, 4] });
						});

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_9, 2);

	$.component(node_13, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_14 = $.sibling(node_13, 2);

	$.component(node_14, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [4, 10, 0],
			castShadow: true,
			'shadow.mapSize': 1024,
			'shadow.camera.left': -10,
			'shadow.camera.right': 10,
			'shadow.camera.top': 10,
			'shadow.camera.bottom': -10
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}