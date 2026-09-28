import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { MeshStandardMaterial } from 'three';

import {
	CABINET_WIDTH,
	CONTROL_PANEL_HEIGHT,
	CONTROL_PANEL_TILT,
	CONTROL_PANEL_Y,
	CROWN_HEIGHT,
	CROWN_Y,
	FIELD_HEIGHT,
	SIDE_RAIL_WIDTH
} from './gameState.svelte';

const cabinetMaterial = new MeshStandardMaterial({ color: '#1f1530', metalness: 0.55, roughness: 0.32 });

const trimMaterial = new MeshStandardMaterial({
	color: '#5a3a8a',
	metalness: 0.6,
	roughness: 0.28,
	emissive: '#3a1f6a',
	emissiveIntensity: 0.35
});

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Cabinet($$anchor, $$props) {
	$.push($$props, true);

	const halfCabinetW = CABINET_WIDTH / 2;
	const rail = SIDE_RAIL_WIDTH;
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [0, CROWN_Y, 0]);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							castShadow: true,
							receiveShadow: true,
							get material() {
								return cabinetMaterial;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								{
									let $0 = $.derived(() => [CABINET_WIDTH, CROWN_HEIGHT, 0.5]);

									$.component(node_2, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, {
											get args() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_3 = $.sibling(node_1, 2);

					{
						let $0 = $.derived(() => [0, -CROWN_HEIGHT / 2 + 0.04, 0.26]);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								get position() {
									return $.get($0);
								},

								get material() {
									return trimMaterial;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => [CABINET_WIDTH, 0.08, 0.02]);

										$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
											T_BoxGeometry_1($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_5 = $.sibling(node, 2);

	$.each(node_5, 16, () => [-1, 1], (side) => side, ($$anchor, side) => {
		var fragment_4 = $.comment();
		var node_6 = $.first_child(fragment_4);

		{
			let $0 = $.derived(() => [side * (halfCabinetW - rail / 2), 0, 0]);

			$.component(node_6, () => T.Group, ($$anchor, T_Group_1) => {
				T_Group_1($$anchor, {
					get position() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_7 = $.first_child(fragment_5);

						$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_2) => {
							T_Mesh_2($$anchor, {
								castShadow: true,
								receiveShadow: true,
								get material() {
									return cabinetMaterial;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_8 = $.first_child(fragment_6);

									{
										let $0 = $.derived(() => [rail, FIELD_HEIGHT, 0.5]);

										$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
											T_BoxGeometry_2($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_7, 2);

						{
							let $0 = $.derived(() => [-side * (rail / 2 - 0.04), 0, 0.26]);

							$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_3) => {
								T_Mesh_3($$anchor, {
									get position() {
										return $.get($0);
									},

									get material() {
										return trimMaterial;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_7 = $.comment();
										var node_10 = $.first_child(fragment_7);

										{
											let $0 = $.derived(() => [0.06, FIELD_HEIGHT - 0.4, 0.02]);

											$.component(node_10, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_3) => {
												T_BoxGeometry_3($$anchor, {
													get args() {
														return $.get($0);
													}
												});
											});
										}

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});
		}

		$.append($$anchor, fragment_4);
	});

	var node_11 = $.sibling(node_5, 2);

	{
		let $0 = $.derived(() => [0, CONTROL_PANEL_Y, 0]);
		let $1 = $.derived(() => [CONTROL_PANEL_TILT, 0, 0]);

		$.component(node_11, () => T.Group, ($$anchor, T_Group_2) => {
			T_Group_2($$anchor, {
				get position() {
					return $.get($0);
				},

				get rotation() {
					return $.get($1);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root();
					var node_12 = $.first_child(fragment_8);

					{
						let $0 = $.derived(() => [0, -CONTROL_PANEL_HEIGHT / 2, 0]);

						$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_4) => {
							T_Mesh_4($$anchor, {
								castShadow: true,
								receiveShadow: true,
								get position() {
									return $.get($0);
								},

								get material() {
									return cabinetMaterial;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_9 = $.comment();
									var node_13 = $.first_child(fragment_9);

									{
										let $0 = $.derived(() => [CABINET_WIDTH, CONTROL_PANEL_HEIGHT, 0.5]);

										$.component(node_13, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_4) => {
											T_BoxGeometry_4($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});
					}

					var node_14 = $.sibling(node_12, 2);

					$.component(node_14, () => T.Mesh, ($$anchor, T_Mesh_5) => {
						T_Mesh_5($$anchor, {
							position: [0, 0, 0.26],
							get material() {
								return trimMaterial;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = $.comment();
								var node_15 = $.first_child(fragment_10);

								{
									let $0 = $.derived(() => [CABINET_WIDTH, 0.06, 0.02]);

									$.component(node_15, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_5) => {
										T_BoxGeometry_5($$anchor, {
											get args() {
												return $.get($0);
											}
										});
									});
								}

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}