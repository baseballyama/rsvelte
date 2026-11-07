import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useGltf, useGltfAnimations, Wireframe } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Character($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const $actions = () => $.store_get(actions, '$actions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const gltf = useGltf('https://threejs.org/examples/models/gltf/Xbot.glb');
	let { actions } = useGltfAnimations(() => $gltf());

	$.user_effect(() => {
		// This effect acts like an init default pose
		$actions()?.idle?.play();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			dispose: false,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.await(node_1, () => gltf, null, ($$anchor, $$source) => {
					var $$value = $.derived(() => {
						var { nodes, materials } = $.get($$source);

						return { nodes, materials };
					});

					var nodes = $.derived(() => $.get($$value).nodes);
					var materials = $.derived(() => $.get($$value).materials);

					T($$anchor, {
						get is() {
							return $.get(nodes).Scene;
						},

						children: ($$anchor, $$slotProps) => {
							T($$anchor, {
								get is() {
									return $.get(nodes).Armature;
								},
								name: 'Armature',
								scale: 0.01,
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_2 = $.first_child(fragment_4);

									T(node_2, {
										get is() {
											return $.get(nodes).mixamorigHips;
										}
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, () => T.SkinnedMesh, ($$anchor, T_SkinnedMesh) => {
										T_SkinnedMesh($$anchor, {
											name: 'Beta_Joints',
											get geometry() {
												return $.get(nodes).Beta_Joints.geometry;
											},

											get material() {
												return $.get(materials).Beta_Joints_MAT;
											},

											get skeleton() {
												return $.get(nodes).Beta_Joints.skeleton;
											},
											castShadow: true
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => T.SkinnedMesh, ($$anchor, T_SkinnedMesh_1) => {
										T_SkinnedMesh_1($$anchor, {
											name: 'Beta_Surface',
											get geometry() {
												return $.get(nodes).Beta_Surface.geometry;
											},

											get material() {
												return $.get(materials)['asdf1:Beta_HighLimbsGeoSG2'];
											},

											get skeleton() {
												return $.get(nodes).Beta_Surface.skeleton;
											},
											castShadow: true,
											children: ($$anchor, $$slotProps) => {
												Wireframe($$anchor, $.spread_props(() => $$props.wireframeProps));
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}