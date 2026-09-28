import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { T } from '@threlte/core';
import { useGltf, useGltfAnimations } from '@threlte/extras';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'fallback',
	'error',
	'children',
	'action',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Robot($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const $actions = () => $.store_get(actions, '$actions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	ref(new Group());

	const gltf = useGltf('/models/RobotExpressive.glb');

	function cloneScene(scene) {
		const clone = cloneSkeleton(scene);
		const nodes = {};

		clone.traverse((child) => {
			if (child.name) nodes[child.name] = child;
		});

		return nodes;
	}

	const { actions, mixer } = useGltfAnimations(() => $gltf(), () => ref());

	$.user_effect(() => {
		if ($$props.action) $actions()[$$props.action]?.play();
	});

	var $$exports = { actions, mixer };

	T($$anchor, $.spread_props(
		{
			get is() {
				return ref();
			},
			dispose: false
		},
		() => props,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				$.await(
					node,
					() => gltf,
					($$anchor) => {
						var fragment_9 = $.comment();
						var node_11 = $.first_child(fragment_9);

						$.snippet(node_11, () => $$props.fallback ?? $.noop);
						$.append($$anchor, fragment_9);
					},
					($$anchor, gltf) => {
						const clonedNodes = $.derived(() => cloneScene($.get(gltf).scene));
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
							T_Group($$anchor, {
								name: 'Root_Scene',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => T.Group, ($$anchor, T_Group_1) => {
										T_Group_1($$anchor, {
											name: 'RootNode',
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root_1();
												var node_3 = $.first_child(fragment_4);

												$.component(node_3, () => T.Group, ($$anchor, T_Group_2) => {
													T_Group_2($$anchor, {
														name: 'RobotArmature',
														rotation: [-Math.PI / 2, 0, 0],
														scale: 100,
														children: ($$anchor, $$slotProps) => {
															T($$anchor, {
																get is() {
																	return $.get(clonedNodes).Bone;
																}
															});
														},
														$$slots: { default: true }
													});
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => T.Group, ($$anchor, T_Group_3) => {
													T_Group_3($$anchor, {
														name: 'HandR',
														position: [0, 2.37, -0.02],
														rotation: [-Math.PI / 2, 0, 0],
														scale: 100,
														children: ($$anchor, $$slotProps) => {
															var fragment_6 = root();
															var node_5 = $.first_child(fragment_6);

															$.component(node_5, () => T.SkinnedMesh, ($$anchor, T_SkinnedMesh) => {
																T_SkinnedMesh($$anchor, {
																	name: 'HandR_1',
																	get geometry() {
																		return $.get(gltf).nodes.HandR_1.geometry;
																	},

																	get material() {
																		return $.get(gltf).materials.Main;
																	},

																	get skeleton() {
																		return $.get(clonedNodes).HandR_1.skeleton;
																	}
																});
															});

															var node_6 = $.sibling(node_5, 2);

															$.component(node_6, () => T.SkinnedMesh, ($$anchor, T_SkinnedMesh_1) => {
																T_SkinnedMesh_1($$anchor, {
																	name: 'HandR_2',
																	get geometry() {
																		return $.get(gltf).nodes.HandR_2.geometry;
																	},

																	get material() {
																		return $.get(gltf).materials.Grey;
																	},

																	get skeleton() {
																		return $.get(clonedNodes).HandR_2.skeleton;
																	}
																});
															});

															$.append($$anchor, fragment_6);
														},
														$$slots: { default: true }
													});
												});

												var node_7 = $.sibling(node_4, 2);

												$.component(node_7, () => T.Group, ($$anchor, T_Group_4) => {
													T_Group_4($$anchor, {
														name: 'HandL',
														position: [0, 2.37, -0.02],
														rotation: [-Math.PI / 2, 0, 0],
														scale: 100,
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root();
															var node_8 = $.first_child(fragment_7);

															$.component(node_8, () => T.SkinnedMesh, ($$anchor, T_SkinnedMesh_2) => {
																T_SkinnedMesh_2($$anchor, {
																	name: 'HandL_1',
																	get geometry() {
																		return $.get(gltf).nodes.HandL_1.geometry;
																	},

																	get material() {
																		return $.get(gltf).materials.Main;
																	},

																	get skeleton() {
																		return $.get(clonedNodes).HandL_1.skeleton;
																	}
																});
															});

															var node_9 = $.sibling(node_8, 2);

															$.component(node_9, () => T.SkinnedMesh, ($$anchor, T_SkinnedMesh_3) => {
																T_SkinnedMesh_3($$anchor, {
																	name: 'HandL_2',
																	get geometry() {
																		return $.get(gltf).nodes.HandL_2.geometry;
																	},

																	get material() {
																		return $.get(gltf).materials.Grey;
																	},

																	get skeleton() {
																		return $.get(clonedNodes).HandL_2.skeleton;
																	}
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
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

						$.append($$anchor, fragment_2);
					},
					($$anchor, err) => {
						var fragment_8 = $.comment();
						var node_10 = $.first_child(fragment_8);

						$.snippet(node_10, () => $$props.error ?? $.noop, () => ({ error: $.get(err) }));
						$.append($$anchor, fragment_8);
					}
				);

				var node_12 = $.sibling(node, 2);

				$.snippet(node_12, () => $$props.children ?? $.noop, () => ({ ref: ref() }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}