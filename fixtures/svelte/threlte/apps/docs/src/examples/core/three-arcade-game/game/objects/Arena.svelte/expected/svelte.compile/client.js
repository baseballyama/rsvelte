import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T } from '@threlte/core';
import { Collider } from '@threlte/rapier';
import { arenaDepth, arenaHeight, arenaWidth } from '../config';
import { useArenaCollisionEnterEvent } from '../hooks/useArenaCollider';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Arena($$anchor, $$props) {
	$.push($$props, true);

	const colliderWidth = 10;
	const sideGridOpacity = 0.7;
	const { onCollision: onTopCollision, opacity: topOpacity } = useArenaCollisionEnterEvent();
	const { onCollision: onLeftCollision, opacity: leftOpacity } = useArenaCollisionEnterEvent();
	const { onCollision: onRightCollision, opacity: rightOpacity } = useArenaCollisionEnterEvent();
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => [arenaWidth, arenaWidth, arenaHeight, arenaWidth]);

		$.component(node, () => T.CustomGridHelper, ($$anchor, T_CustomGridHelper) => {
			T_CustomGridHelper($$anchor, {
				get args() {
					return $.get($0);
				},
				'position.y': -0.5,
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial) => {
						T_LineBasicMaterial($$anchor, { color: 'green', transparent: true, opacity: 0.1 });
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [arenaDepth, arenaDepth, arenaHeight, arenaHeight]);
		let $1 = $.derived(() => 90 * MathUtils.DEG2RAD);
		let $2 = $.derived(() => arenaWidth / 2 * -1);

		$.component(node_2, () => T.CustomGridHelper, ($$anchor, T_CustomGridHelper_1) => {
			T_CustomGridHelper_1($$anchor, {
				get args() {
					return $.get($0);
				},

				get 'rotation.z'() {
					return $.get($1);
				},

				get 'position.x'() {
					return $.get($2);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					$.component(node_3, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial_1) => {
						T_LineBasicMaterial_1($$anchor, { color: 'green', transparent: true, opacity: sideGridOpacity });
					});

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => 90 * MathUtils.DEG2RAD);

						$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								get 'rotation.x'() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_5 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => [arenaDepth, arenaHeight]);

										$.component(node_5, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
											T_PlaneGeometry($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									var node_6 = $.sibling(node_5, 2);

									$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
										T_MeshBasicMaterial($$anchor, {
											color: 'green',
											transparent: true,
											get opacity() {
												return leftOpacity.current;
											}
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_7 = $.sibling(node_2, 2);

	{
		let $0 = $.derived(() => [arenaDepth, arenaDepth, arenaHeight, arenaHeight]);
		let $1 = $.derived(() => 90 * MathUtils.DEG2RAD);
		let $2 = $.derived(() => arenaWidth / 2);

		$.component(node_7, () => T.CustomGridHelper, ($$anchor, T_CustomGridHelper_2) => {
			T_CustomGridHelper_2($$anchor, {
				get args() {
					return $.get($0);
				},

				get 'rotation.z'() {
					return $.get($1);
				},

				get 'position.x'() {
					return $.get($2);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_8 = $.first_child(fragment_4);

					$.component(node_8, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial_2) => {
						T_LineBasicMaterial_2($$anchor, { color: 'green', transparent: true, opacity: sideGridOpacity });
					});

					var node_9 = $.sibling(node_8, 2);

					{
						let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

						$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
							T_Mesh_1($$anchor, {
								get 'rotation.x'() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root();
									var node_10 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => [arenaDepth, arenaHeight]);

										$.component(node_10, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
											T_PlaneGeometry_1($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									var node_11 = $.sibling(node_10, 2);

									$.component(node_11, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
										T_MeshBasicMaterial_1($$anchor, {
											color: 'green',
											transparent: true,
											get opacity() {
												return rightOpacity.current;
											}
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_12 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => [arenaDepth, arenaDepth, arenaHeight, arenaHeight]);
		let $1 = $.derived(() => 90 * MathUtils.DEG2RAD);
		let $2 = $.derived(() => 90 * MathUtils.DEG2RAD);
		let $3 = $.derived(() => arenaHeight / 2 * -1);

		$.component(node_12, () => T.CustomGridHelper, ($$anchor, T_CustomGridHelper_3) => {
			T_CustomGridHelper_3($$anchor, {
				get args() {
					return $.get($0);
				},

				get 'rotation.y'() {
					return $.get($1);
				},

				get 'rotation.x'() {
					return $.get($2);
				},

				get 'position.z'() {
					return $.get($3);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root();
					var node_13 = $.first_child(fragment_6);

					$.component(node_13, () => T.LineBasicMaterial, ($$anchor, T_LineBasicMaterial_3) => {
						T_LineBasicMaterial_3($$anchor, { color: 'green', transparent: true, opacity: sideGridOpacity });
					});

					var node_14 = $.sibling(node_13, 2);

					{
						let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

						$.component(node_14, () => T.Mesh, ($$anchor, T_Mesh_2) => {
							T_Mesh_2($$anchor, {
								get 'rotation.x'() {
									return $.get($0);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root();
									var node_15 = $.first_child(fragment_7);

									{
										let $0 = $.derived(() => [arenaDepth, arenaHeight]);

										$.component(node_15, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_2) => {
											T_PlaneGeometry_2($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									var node_16 = $.sibling(node_15, 2);

									$.component(node_16, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_2) => {
										T_MeshBasicMaterial_2($$anchor, {
											color: 'green',
											transparent: true,
											get opacity() {
												return topOpacity.current;
											}
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_17 = $.sibling(node_12, 2);

	{
		let $0 = $.derived(() => [(colliderWidth / 2 + arenaWidth / 2) * -1, 0, 0]);

		$.component(node_17, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [colliderWidth / 2, 1 / 2, arenaHeight / 2]);

						Collider($$anchor, {
							get oncollisionenter() {
								return onLeftCollision;
							},
							shape: 'cuboid',
							get args() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});
		});
	}

	var node_18 = $.sibling(node_17, 2);

	{
		let $0 = $.derived(() => [colliderWidth / 2 + arenaWidth / 2, 0, 0]);

		$.component(node_18, () => T.Group, ($$anchor, T_Group_1) => {
			T_Group_1($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [colliderWidth / 2, 1 / 2, arenaHeight / 2]);

						Collider($$anchor, {
							get oncollisionenter() {
								return onRightCollision;
							},
							shape: 'cuboid',
							get args() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});
		});
	}

	var node_19 = $.sibling(node_18, 2);

	{
		let $0 = $.derived(() => [0, 0, (colliderWidth / 2 + arenaHeight / 2) * -1]);

		$.component(node_19, () => T.Group, ($$anchor, T_Group_2) => {
			T_Group_2($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [
							(colliderWidth * 2 + arenaWidth) / 2,
							1 / 2,
							colliderWidth / 2
						]);

						Collider($$anchor, {
							get oncollisionenter() {
								return onTopCollision;
							},
							shape: 'cuboid',
							get args() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});
		});
	}

	var node_20 = $.sibling(node_19, 2);

	{
		let $0 = $.derived(() => [0, 0, colliderWidth / 2 + arenaHeight / 2]);

		$.component(node_20, () => T.Group, ($$anchor, T_Group_3) => {
			T_Group_3($$anchor, {
				get position() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [
							(colliderWidth * 2 + arenaWidth) / 2,
							1 / 2,
							colliderWidth / 2
						]);

						Collider($$anchor, {
							sensor: true,
							shape: 'cuboid',
							get args() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}