import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { Attractor, Collider, RigidBody } from '@threlte/rapier';
import { MeshBasicMaterial, SphereGeometry } from 'three';

const geometry = new SphereGeometry(1);
const material = new MeshBasicMaterial({ color: 'red' });
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function AdvancedScene($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, 'static');
	let hide = $.state(false);

	const reset = () => {
		$.set(hide, true);
		setTimeout(() => $.set(hide, false));
	};

	const config = {
		static: {
			type: 'static',
			strength: 3,
			range: 100,
			gravitationalConstant: undefined
		},
		linear: {
			type: 'linear',
			strength: 1,
			range: 100,
			gravitationalConstant: undefined
		},
		newtonian: {
			type: 'newtonian',
			strength: 10,
			range: 100,
			gravitationalConstant: 10
		}
	};

	var $$exports = { reset };
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			'position.y': 50,
			'position.z': 100,
			makeDefault: true,
			fov: 70,
			far: 10000,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { 'target.y': 20 });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [8, 20, -3] });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [100] });
	});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			$.component(node_4, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					position: [-50, 0, 0],
					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							linearVelocity: [5, -5, 0],
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_5 = $.first_child(fragment_4);

								Collider(node_5, {
									shape: 'ball',
									args: [1],
									get mass() {
										return config[type()].strength;
									}
								});

								var node_6 = $.sibling(node_5, 2);

								$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										get geometry() {
											return geometry;
										},

										get material() {
											return material;
										}
									});
								});

								var node_7 = $.sibling(node_6, 2);

								Attractor(node_7, {
									get range() {
										return config[type()].range;
									},

									get gravitationalConstant() {
										return config[type()].gravitationalConstant;
									},

									get strength() {
										return config[type()].strength;
									},

									get gravityType() {
										return type();
									}
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_4, 2);

			RigidBody(node_8, {
				linearVelocity: [0, 5, 0],
				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_9 = $.first_child(fragment_5);

					Collider(node_9, {
						shape: 'ball',
						args: [1],
						get mass() {
							return config[type()].strength;
						}
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							get geometry() {
								return geometry;
							},

							get material() {
								return material;
							}
						});
					});

					var node_11 = $.sibling(node_10, 2);

					Attractor(node_11, {
						get range() {
							return config[type()].range;
						},

						get gravitationalConstant() {
							return config[type()].gravitationalConstant;
						},

						get strength() {
							return config[type()].strength;
						},

						get gravityType() {
							return type();
						}
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_12 = $.sibling(node_8, 2);

			$.component(node_12, () => T.Group, ($$anchor, T_Group_1) => {
				T_Group_1($$anchor, {
					position: [50, 0, 0],
					children: ($$anchor, $$slotProps) => {
						RigidBody($$anchor, {
							linearVelocity: [-5, 0, 5],
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_13 = $.first_child(fragment_7);

								Collider(node_13, {
									shape: 'ball',
									args: [1],
									get mass() {
										return config[type()].strength;
									}
								});

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => T.Mesh, ($$anchor, T_Mesh_2) => {
									T_Mesh_2($$anchor, {
										get geometry() {
											return geometry;
										},

										get material() {
											return material;
										}
									});
								});

								var node_15 = $.sibling(node_14, 2);

								Attractor(node_15, {
									get range() {
										return config[type()].range;
									},

									get gravitationalConstant() {
										return config[type()].gravitationalConstant;
									},

									get strength() {
										return config[type()].strength;
									},

									get gravityType() {
										return type();
									}
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_3, ($$render) => {
			if (!$.get(hide)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}