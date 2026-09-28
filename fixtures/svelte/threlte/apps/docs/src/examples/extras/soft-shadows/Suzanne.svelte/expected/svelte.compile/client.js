import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Float, useGltf } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Suzanne($$anchor, $$props) {
	$.push($$props, true);

	let rotation = $.state(0);

	useTask((dt) => {
		$.set(rotation, $.get(rotation) + dt);
	});

	const gltf = useGltf('/models/Suzanne.glb');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			dispose: false,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.await(node_1, () => gltf, null, ($$anchor, gltf) => {
					var fragment_2 = root();
					var node_2 = $.first_child(fragment_2);

					Float(node_2, {
						floatIntensity: 10,
						speed: 2,
						floatingRange: [0.15, 0.4],
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									castShadow: true,
									receiveShadow: true,
									get geometry() {
										return $.get(gltf).nodes.Suzanne.geometry;
									},

									get material() {
										return $.get(gltf).materials.Mat;
									},
									'rotation.x': -0.62,
									get 'rotation.y'() {
										return $.get(rotation);
									}
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_2, 2);

					Float(node_4, {
						floatIntensity: 8,
						seed: 1,
						speed: 3,
						floatingRange: [0.2, 0.6],
						position: [2.2, 0, -0.5],
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => 0.09 + $.get(rotation));
								let $1 = $.derived(() => 1.4 + $.get(rotation) / 2);

								$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
									T_Mesh_1($$anchor, {
										castShadow: true,
										receiveShadow: true,
										get geometry() {
											return $.get(gltf).nodes.Icosphere.geometry;
										},

										get material() {
											return $.get(gltf).materials.Mat;
										},
										'rotation.x': -0.62,
										get 'rotation.y'() {
											return $.get($0);
										},

										get 'rotation.z'() {
											return $.get($1);
										}
									});
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_4, 2);

					Float(node_6, {
						floatIntensity: 6,
						seed: 2,
						speed: 4,
						floatingRange: [0.2, 0.5],
						position: [-2.4, 0, 0.2],
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_7 = $.first_child(fragment_5);

							$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_2) => {
								T_Mesh_2($$anchor, {
									castShadow: true,
									receiveShadow: true,
									get geometry() {
										return $.get(gltf).nodes.Cylinder.geometry;
									},

									get material() {
										return $.get(gltf).materials.Mat;
									}
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_6, 2);

					$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_3) => {
						T_Mesh_3($$anchor, {
							receiveShadow: true,
							get geometry() {
								return $.get(gltf).nodes.Floor.geometry;
							},

							get material() {
								return $.get(gltf).materials.Mat;
							},
							position: [0, -0.1, 0]
						});
					});

					$.append($$anchor, fragment_2);
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}