import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	AddEquation,
	CustomBlending,
	Group,
	LessEqualDepth,
	Material,
	OneFactor
} from 'three';

import { T } from '@threlte/core';
import { useGltf, useDraco, useTexture } from '@threlte/extras';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'fallback',
	'error',
	'children',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Spaceship($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const dracoLoader = useDraco();
	const gltf = useGltf('/spaceship-tutorial/models/spaceship-transformed.glb', { dracoLoader });
	const map = useTexture('/spaceship-tutorial/textures/energy-beam-opacity.png');

	function alphaFix(material) {
		material.transparent = true;
		material.alphaToCoverage = true;
		material.depthFunc = LessEqualDepth;
		material.depthTest = true;
		material.depthWrite = true;
	}

	gltf.then((model) => {
		alphaFix(model.materials.spaceship_racer);
		alphaFix(model.materials.cockpit);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, $.spread_props({ dispose: false }, () => props, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.await(
					node_1,
					() => gltf,
					($$anchor) => {
						var fragment_7 = $.comment();
						var node_10 = $.first_child(fragment_7);

						$.snippet(node_10, () => $$props.fallback ?? $.noop);
						$.append($$anchor, fragment_7);
					},
					($$anchor, gltf) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.Group, ($$anchor, T_Group_1) => {
							T_Group_1($$anchor, {
								scale: 0.003,
								rotation: [0, -Math.PI * 0.5, 0],
								position: [0.95, 0, 0],
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
										T_Mesh($$anchor, {
											castShadow: true,
											receiveShadow: true,
											get geometry() {
												return $.get(gltf).nodes.Cube001_spaceship_racer_0.geometry;
											},

											get material() {
												return $.get(gltf).materials.spaceship_racer;
											}
										});
									});

									var node_4 = $.sibling(node_3, 2);

									$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
										T_Mesh_1($$anchor, {
											castShadow: true,
											receiveShadow: true,
											get geometry() {
												return $.get(gltf).nodes.Cube005_cockpit_0.geometry;
											},

											get material() {
												return $.get(gltf).materials.cockpit;
											}
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.await(node_5, () => map, null, ($$anchor, mapValue) => {
										var fragment_4 = $.comment();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_2) => {
											T_Mesh_2($$anchor, {
												position: [0, 0, -1350],
												'rotation.x': Math.PI * 0.5,
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													$.component(node_7, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
														T_CylinderGeometry($$anchor, { args: [70, 25, 1600, 15] });
													});

													var node_8 = $.sibling(node_7, 2);

													$.component(node_8, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
														T_MeshBasicMaterial($$anchor, {
															color: [1.0, 0.4, 0.02],
															get alphaMap() {
																return $.get(mapValue);
															},
															transparent: true,
															get blending() {
																return CustomBlending;
															},

															get blendDst() {
																return OneFactor;
															},

															get blendEquation() {
																return AddEquation;
															}
														});
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					($$anchor, err) => {
						var fragment_6 = $.comment();
						var node_9 = $.first_child(fragment_6);

						$.snippet(node_9, () => $$props.error ?? $.noop, () => ({ error: $.get(err) }));
						$.append($$anchor, fragment_6);
					}
				);

				var node_11 = $.sibling(node_1, 2);

				$.snippet(node_11, () => $$props.children ?? $.noop, () => ({ ref: ref() }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}