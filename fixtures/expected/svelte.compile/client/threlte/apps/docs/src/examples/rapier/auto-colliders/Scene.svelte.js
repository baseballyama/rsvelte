import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, Environment, useGltf } from '@threlte/extras';
import { AutoColliders, RigidBody } from '@threlte/rapier';
import { derived } from 'svelte/store';
import { MathUtils } from 'three';
import Ground from './Ground.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $helmet = () => $.store_get(helmet, '$helmet', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const gltf = useGltf('/models/helmet/DamagedHelmet.gltf');

	const helmet = derived(gltf, (gltf) => {
		if (!gltf || !gltf.nodes['node_damagedHelmet_-6514']) return;

		return gltf.nodes['node_damagedHelmet_-6514'];
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.x': 12,
			'position.y': 13,
			fov: 40,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [8, 20, -3] });
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => [90 * MathUtils.DEG2RAD, 0, 0]);

				$.component(node_4, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						position: [-2.5, 2, 2.5],
						get rotation() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'convexHull',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_5 = $.first_child(fragment_5);

											$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
												T_Mesh($$anchor, {
													castShadow: true,
													get geometry() {
														return $helmet().geometry;
													},

													get material() {
														return $helmet().material;
													}
												});
											});

											$.append($$anchor, fragment_5);
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

			var node_6 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => [90 * MathUtils.DEG2RAD, 0, 0]);

				$.component(node_6, () => T.Group, ($$anchor, T_Group_1) => {
					T_Group_1($$anchor, {
						position: [2.5, 2, 2.5],
						get rotation() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'ball',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_7 = $.first_child(fragment_8);

											$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
												T_Mesh_1($$anchor, {
													castShadow: true,
													get geometry() {
														return $helmet().geometry;
													},

													get material() {
														return $helmet().material;
													}
												});
											});

											$.append($$anchor, fragment_8);
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

			var node_8 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => [90 * MathUtils.DEG2RAD, 0, 0]);

				$.component(node_8, () => T.Group, ($$anchor, T_Group_2) => {
					T_Group_2($$anchor, {
						position: [2.5, 2, -2.5],
						get rotation() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'cuboid',
										children: ($$anchor, $$slotProps) => {
											var fragment_11 = $.comment();
											var node_9 = $.first_child(fragment_11);

											$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
												T_Mesh_2($$anchor, {
													castShadow: true,
													get geometry() {
														return $helmet().geometry;
													},

													get material() {
														return $helmet().material;
													}
												});
											});

											$.append($$anchor, fragment_11);
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

			var node_10 = $.sibling(node_8, 2);

			{
				let $0 = $.derived(() => [90 * MathUtils.DEG2RAD, 0, 0]);

				$.component(node_10, () => T.Group, ($$anchor, T_Group_3) => {
					T_Group_3($$anchor, {
						position: [0, 2, 0],
						get rotation() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'trimesh',
										children: ($$anchor, $$slotProps) => {
											var fragment_14 = $.comment();
											var node_11 = $.first_child(fragment_14);

											$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_3) => {
												T_Mesh_3($$anchor, {
													castShadow: true,
													get geometry() {
														return $helmet().geometry;
													},

													get material() {
														return $helmet().material;
													}
												});
											});

											$.append($$anchor, fragment_14);
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

			var node_12 = $.sibling(node_10, 2);

			{
				let $0 = $.derived(() => [90 * MathUtils.DEG2RAD, 0, 0]);

				$.component(node_12, () => T.Group, ($$anchor, T_Group_4) => {
					T_Group_4($$anchor, {
						position: [-2.5, 2, -2.5],
						get rotation() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							RigidBody($$anchor, {
								children: ($$anchor, $$slotProps) => {
									AutoColliders($$anchor, {
										shape: 'capsule',
										children: ($$anchor, $$slotProps) => {
											var fragment_17 = $.comment();
											var node_13 = $.first_child(fragment_17);

											$.component(node_13, () => T.Mesh, ($$anchor, T_Mesh_4) => {
												T_Mesh_4($$anchor, {
													castShadow: true,
													get geometry() {
														return $helmet().geometry;
													},

													get material() {
														return $helmet().material;
													}
												});
											});

											$.append($$anchor, fragment_17);
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

			$.append($$anchor, fragment_2);
		};

		$.if(node_3, ($$render) => {
			if ($helmet()) $$render(consequent);
		});
	}

	var node_14 = $.sibling(node_3, 2);

	$.component(node_14, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [50] });
	});

	var node_15 = $.sibling(node_14, 2);

	Ground(node_15, {});
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}