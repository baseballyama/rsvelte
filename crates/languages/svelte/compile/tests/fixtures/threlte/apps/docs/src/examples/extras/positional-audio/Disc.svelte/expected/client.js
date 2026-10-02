import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Edges, useGltf } from '@threlte/extras';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'discSpeed']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Disc($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let discSpeed = $.prop($$props, 'discSpeed', 3, 0),
		rest = $.rest_props($$props, rest_excludes);

	let discRotation = $.state(0);

	useTask(
		(delta) => {
			$.set(discRotation, $.get(discRotation) + delta * discSpeed());
		},
		{ running: () => discSpeed() > 0 }
	);

	const gltf = useGltf('/models/turntable/disc-logo.glb');
	const logoGeometry = $.derived(() => $gltf()?.nodes.Logo.geometry);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, $.spread_props(() => rest, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => -$.get(discRotation));

					$.component(node_1, () => T.Group, ($$anchor, T_Group_1) => {
						T_Group_1($$anchor, {
							get 'rotation.y'() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_2 = $.first_child(fragment_2);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										receiveShadow: true,
										castShadow: true,
										'position.y': 0.1,
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_3 = $.first_child(fragment_3);

											$.component(node_3, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
												T_CylinderGeometry($$anchor, { args: [1.85, 2, 0.2, 64] });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, { color: '#111111' });
											});

											var node_5 = $.sibling(node_4, 2);

											Edges(node_5, { color: 'black', thresholdAngle: 20 });
											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								var node_6 = $.sibling(node_2, 2);

								$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
									T_Mesh_1($$anchor, {
										receiveShadow: true,
										castShadow: true,
										'position.y': 0.2 + 0.05,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_7 = $.first_child(fragment_4);

											$.component(node_7, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_1) => {
												T_CylinderGeometry_1($$anchor, { args: [1.75, 1.75, 0.05, 64] });
											});

											var node_8 = $.sibling(node_7, 2);

											$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
												T_MeshStandardMaterial_1($$anchor, { color: '#111111' });
											});

											var node_9 = $.sibling(node_8, 2);

											Edges(node_9, { thresholdAngle: 50, scale: 1, color: 'black' });
											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_10 = $.sibling(node_6, 2);

								$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_2) => {
									T_Mesh_2($$anchor, {
										receiveShadow: true,
										castShadow: true,
										'position.y': 0.2 + 0.05 + 0.005,
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_11 = $.first_child(fragment_5);

											$.component(node_11, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_2) => {
												T_CylinderGeometry_2($$anchor, { args: [0.8, 0.8, 0.05, 64] });
											});

											var node_12 = $.sibling(node_11, 2);

											$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
												T_MeshStandardMaterial_2($$anchor, { color: '#eedbcb' });
											});

											var node_13 = $.sibling(node_12, 2);

											Edges(node_13, { thresholdAngle: 50, scale: 1, color: 'black' });
											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								var node_14 = $.sibling(node_10, 2);

								{
									var consequent = ($$anchor) => {
										var fragment_6 = $.comment();
										var node_15 = $.first_child(fragment_6);

										$.component(node_15, () => T.Mesh, ($$anchor, T_Mesh_3) => {
											T_Mesh_3($$anchor, {
												get geometry() {
													return $.get(logoGeometry);
												},
												'position.y': 0.2 + 0.05 + 0.025 + 0.01,
												children: ($$anchor, $$slotProps) => {
													var fragment_7 = $.comment();
													var node_16 = $.first_child(fragment_7);

													$.component(node_16, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
														T_MeshBasicMaterial($$anchor, { color: '#ff3e00', toneMapped: false });
													});

													$.append($$anchor, fragment_7);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_6);
									};

									$.if(node_14, ($$render) => {
										if ($.get(logoGeometry)) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}