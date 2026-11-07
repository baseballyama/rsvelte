import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Edges } from '@threlte/extras';
import { BoxGeometry, MeshBasicMaterial, MathUtils } from 'three';
import { game } from '../Game.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function ThrelteLogo($$anchor, $$props) {
	$.push($$props, true);

	let scale = $.prop($$props, 'scale', 3, 1),
		positionZ = $.prop($$props, 'positionZ', 3, 0),
		direction = $.prop($$props, 'direction', 3, 1);

	const geometry = new BoxGeometry(1, 1, 1);
	const material = new MeshBasicMaterial({ transparent: true, opacity: 0 });
	let rotationY = $.state(0);

	useTask((delta) => {
		$.set(rotationY, $.get(rotationY) + delta * direction());
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => -65 * MathUtils.DEG2RAD);

		$.component(node, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get 'rotation.x'() {
					return $.get($0);
				},

				get 'rotation.y'() {
					return $.get(rotationY);
				},

				get 'position.z'() {
					return positionZ();
				},

				get scale() {
					return scale();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
						T_Mesh($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								T(node_2, {
									get is() {
										return geometry;
									}
								});

								var node_3 = $.sibling(node_2, 2);

								T(node_3, {
									get is() {
										return material;
									}
								});

								var node_4 = $.sibling(node_3, 2);

								Edges(node_4, {
									get color() {
										return game.baseColor;
									}
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					var node_5 = $.sibling(node_1, 2);

					$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							'position.x': 1,
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_6 = $.first_child(fragment_3);

								T(node_6, {
									get is() {
										return geometry;
									}
								});

								var node_7 = $.sibling(node_6, 2);

								T(node_7, {
									get is() {
										return material;
									}
								});

								var node_8 = $.sibling(node_7, 2);

								Edges(node_8, {
									get color() {
										return game.baseColor;
									}
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					var node_9 = $.sibling(node_5, 2);

					$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
						T_Mesh_2($$anchor, {
							'position.x': -1,
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_10 = $.first_child(fragment_4);

								T(node_10, {
									get is() {
										return geometry;
									}
								});

								var node_11 = $.sibling(node_10, 2);

								T(node_11, {
									get is() {
										return material;
									}
								});

								var node_12 = $.sibling(node_11, 2);

								Edges(node_12, {
									get color() {
										return game.baseColor;
									}
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					var node_13 = $.sibling(node_9, 2);

					$.component(node_13, () => T.Mesh, ($$anchor, T_Mesh_3) => {
						T_Mesh_3($$anchor, {
							'position.z': 1,
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root();
								var node_14 = $.first_child(fragment_5);

								T(node_14, {
									get is() {
										return geometry;
									}
								});

								var node_15 = $.sibling(node_14, 2);

								T(node_15, {
									get is() {
										return material;
									}
								});

								var node_16 = $.sibling(node_15, 2);

								Edges(node_16, {
									get color() {
										return game.baseColor;
									}
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					var node_17 = $.sibling(node_13, 2);

					$.component(node_17, () => T.Mesh, ($$anchor, T_Mesh_4) => {
						T_Mesh_4($$anchor, {
							'position.z': -1,
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_18 = $.first_child(fragment_6);

								T(node_18, {
									get is() {
										return geometry;
									}
								});

								var node_19 = $.sibling(node_18, 2);

								T(node_19, {
									get is() {
										return material;
									}
								});

								var node_20 = $.sibling(node_19, 2);

								Edges(node_20, {
									get color() {
										return game.baseColor;
									}
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					var node_21 = $.sibling(node_17, 2);

					$.component(node_21, () => T.Mesh, ($$anchor, T_Mesh_5) => {
						T_Mesh_5($$anchor, {
							'position.y': 1,
							children: ($$anchor, $$slotProps) => {
								var fragment_7 = root();
								var node_22 = $.first_child(fragment_7);

								T(node_22, {
									get is() {
										return geometry;
									}
								});

								var node_23 = $.sibling(node_22, 2);

								T(node_23, {
									get is() {
										return material;
									}
								});

								var node_24 = $.sibling(node_23, 2);

								Edges(node_24, {
									get color() {
										return game.baseColor;
									}
								});

								$.append($$anchor, fragment_7);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}