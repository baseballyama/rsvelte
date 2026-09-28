import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Collider, RigidBody } from '@threlte/rapier';
import { CHANNEL_BOTTOM_Y, CHANNEL_TOP_Y, FIELD_HEIGHT, FIELD_WIDTH } from './gameState.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>  <!> <!>`, 1);

export default function Frame($$anchor) {
	const wallThickness = 0.18;
	const channelWidth = 0.5;
	const halfW = FIELD_WIDTH / 2;
	const halfH = FIELD_HEIGHT / 2;
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			position: [0, 0, -0.18],
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => [FIELD_WIDTH, FIELD_HEIGHT, 0.05]);

					$.component(node_1, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
						T_BoxGeometry($$anchor, {
							get args() {
								return $.get($0);
							}
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: '#211a36', roughness: 0.85, metalness: 0.1 });
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_3 = $.sibling(node, 2);

	RigidBody(node_3, {
		type: 'fixed',
		children: ($$anchor, $$slotProps) => {
			const channelWallLen = $.derived(() => (CHANNEL_TOP_Y - CHANNEL_BOTTOM_Y) / 2);
			const channelWallCenterY = $.derived(() => (CHANNEL_TOP_Y + CHANNEL_BOTTOM_Y) / 2);
			var fragment_2 = root_1();
			var node_4 = $.first_child(fragment_2);

			{
				let $0 = $.derived(() => [-halfW, 0, 0]);

				$.component(node_4, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						get position() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => [wallThickness / 2, halfH, 0.3]);

								Collider(node_5, {
									shape: 'cuboid',
									get args() {
										return $.get($0);
									}
								});
							}

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_1) => {
								T_Mesh_1($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_7 = $.first_child(fragment_4);

										{
											let $0 = $.derived(() => [wallThickness, FIELD_HEIGHT, 0.4]);

											$.component(node_7, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
												T_BoxGeometry_1($$anchor, {
													get args() {
														return $.get($0);
													}
												});
											});
										}

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
											T_MeshStandardMaterial_1($$anchor, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
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
				});
			}

			var node_9 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => [halfW, 0, 0]);

				$.component(node_9, () => T.Group, ($$anchor, T_Group_1) => {
					T_Group_1($$anchor, {
						get position() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_10 = $.first_child(fragment_5);

							{
								let $0 = $.derived(() => [wallThickness / 2, halfH, 0.3]);

								Collider(node_10, {
									shape: 'cuboid',
									get args() {
										return $.get($0);
									}
								});
							}

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_2) => {
								T_Mesh_2($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_6 = root();
										var node_12 = $.first_child(fragment_6);

										{
											let $0 = $.derived(() => [wallThickness, FIELD_HEIGHT, 0.4]);

											$.component(node_12, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
												T_BoxGeometry_2($$anchor, {
													get args() {
														return $.get($0);
													}
												});
											});
										}

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
											T_MeshStandardMaterial_2($$anchor, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
										});

										$.append($$anchor, fragment_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});
			}

			var node_14 = $.sibling(node_9, 2);

			{
				let $0 = $.derived(() => [0, halfH, 0]);

				$.component(node_14, () => T.Group, ($$anchor, T_Group_2) => {
					T_Group_2($$anchor, {
						get position() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_7 = root();
							var node_15 = $.first_child(fragment_7);

							{
								let $0 = $.derived(() => [halfW, wallThickness / 2, 0.3]);

								Collider(node_15, {
									shape: 'cuboid',
									get args() {
										return $.get($0);
									}
								});
							}

							var node_16 = $.sibling(node_15, 2);

							$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_3) => {
								T_Mesh_3($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root();
										var node_17 = $.first_child(fragment_8);

										{
											let $0 = $.derived(() => [FIELD_WIDTH, wallThickness, 0.4]);

											$.component(node_17, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_3) => {
												T_BoxGeometry_3($$anchor, {
													get args() {
														return $.get($0);
													}
												});
											});
										}

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
											T_MeshStandardMaterial_3($$anchor, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
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
				});
			}

			var node_19 = $.sibling(node_14, 2);

			{
				let $0 = $.derived(() => [0, -halfH, 0]);

				$.component(node_19, () => T.Group, ($$anchor, T_Group_3) => {
					T_Group_3($$anchor, {
						get position() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root();
							var node_20 = $.first_child(fragment_9);

							{
								let $0 = $.derived(() => [halfW, wallThickness / 2, 0.3]);

								Collider(node_20, {
									shape: 'cuboid',
									get args() {
										return $.get($0);
									}
								});
							}

							var node_21 = $.sibling(node_20, 2);

							$.component(node_21, () => T.Mesh, ($$anchor, T_Mesh_4) => {
								T_Mesh_4($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_10 = root();
										var node_22 = $.first_child(fragment_10);

										{
											let $0 = $.derived(() => [FIELD_WIDTH, wallThickness, 0.4]);

											$.component(node_22, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_4) => {
												T_BoxGeometry_4($$anchor, {
													get args() {
														return $.get($0);
													}
												});
											});
										}

										var node_23 = $.sibling(node_22, 2);

										$.component(node_23, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_4) => {
											T_MeshStandardMaterial_4($$anchor, { color: '#3a2a55', metalness: 0.4, roughness: 0.35 });
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
				});
			}

			var node_24 = $.sibling(node_19, 2);

			{
				let $0 = $.derived(() => [
					halfW - channelWidth - wallThickness / 2,
					$.get(channelWallCenterY),
					0
				]);

				$.component(node_24, () => T.Group, ($$anchor, T_Group_4) => {
					T_Group_4($$anchor, {
						get position() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root();
							var node_25 = $.first_child(fragment_11);

							{
								let $0 = $.derived(() => [wallThickness / 2, $.get(channelWallLen), 0.3]);

								Collider(node_25, {
									shape: 'cuboid',
									get args() {
										return $.get($0);
									}
								});
							}

							var node_26 = $.sibling(node_25, 2);

							$.component(node_26, () => T.Mesh, ($$anchor, T_Mesh_5) => {
								T_Mesh_5($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_12 = root();
										var node_27 = $.first_child(fragment_12);

										{
											let $0 = $.derived(() => [wallThickness, $.get(channelWallLen) * 2, 0.4]);

											$.component(node_27, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_5) => {
												T_BoxGeometry_5($$anchor, {
													get args() {
														return $.get($0);
													}
												});
											});
										}

										var node_28 = $.sibling(node_27, 2);

										$.component(node_28, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_5) => {
											T_MeshStandardMaterial_5($$anchor, { color: '#5a3a8a', metalness: 0.5, roughness: 0.3 });
										});

										$.append($$anchor, fragment_12);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				});
			}

			var node_29 = $.sibling(node_24, 2);

			{
				let $0 = $.derived(() => [halfW - 0.9, CHANNEL_TOP_Y + 1.5, 0]);

				$.component(node_29, () => T.Group, ($$anchor, T_Group_5) => {
					T_Group_5($$anchor, {
						get position() {
							return $.get($0);
						},
						rotation: [0, 0, -Math.PI / 4],
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root();
							var node_30 = $.first_child(fragment_13);

							Collider(node_30, { shape: 'cuboid', args: [1.2, wallThickness / 2, 0.3] });

							var node_31 = $.sibling(node_30, 2);

							$.component(node_31, () => T.Mesh, ($$anchor, T_Mesh_6) => {
								T_Mesh_6($$anchor, {
									castShadow: true,
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root();
										var node_32 = $.first_child(fragment_14);

										$.component(node_32, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_6) => {
											T_BoxGeometry_6($$anchor, { args: [2.4, wallThickness, 0.4] });
										});

										var node_33 = $.sibling(node_32, 2);

										$.component(node_33, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_6) => {
											T_MeshStandardMaterial_6($$anchor, { color: '#5a3a8a', metalness: 0.5, roughness: 0.3 });
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}