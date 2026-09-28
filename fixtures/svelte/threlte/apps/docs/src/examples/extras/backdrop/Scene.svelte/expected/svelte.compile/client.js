import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';

import {
	BackdropGeometry,
	Bounds,
	Environment,
	Gizmo,
	OrbitControls,
	TransformControls
} from '@threlte/extras';

import { useGltf } from '@threlte/extras';
import { isInstanceOf, T, useThrelte } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let materialColor = $.prop($$props, 'materialColor', 3, 'white'),
		materialWireframe = $.prop($$props, 'materialWireframe', 3, false);

	const gltf = useGltf('/models/Duck.glb').then((gltf) => {
		gltf.nodes.LOD3spShape.castShadow = true;

		return gltf;
	});

	const { scene } = useThrelte();
	let helper = $.state(void 0);
	let light = $.state(void 0);
	let debug = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Environment(node, {
		url: '/textures/equirectangular/hdr/blouberg_sunrise_2_1k.hdr'
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let ref = () => ($$arg0?.()).ref;
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => [ref()]);

						$.component(node_3, () => T.DirectionalLightHelper, ($$anchor, T_DirectionalLightHelper) => {
							T_DirectionalLightHelper($$anchor, {
								get args() {
									return $.get($0);
								},

								get attach() {
									return scene;
								},

								get ref() {
									return $.get(helper);
								},

								set ref($$value) {
									$.set(helper, $$value);
								}
							});
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						let $0 = $.derived(() => [ref().shadow.camera]);

						$.component(node_4, () => T.CameraHelper, ($$anchor, T_CameraHelper) => {
							T_CameraHelper($$anchor, {
								get args() {
									return $.get($0);
								}
							});
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node_2, ($$render) => {
					if (debug) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
			T_DirectionalLight($$anchor, {
				'position.x': 2,
				'position.y': 0.5,
				'position.z': 10,
				intensity: 2,
				castShadow: true,
				'shadow.camera.left': -10,
				'shadow.camera.right': 10,
				'shadow.camera.top': -10,
				'shadow.camera.bottom': 10,
				'shadow.bias': -0.001,
				get ref() {
					return $.get(light);
				},

				set ref($$value) {
					$.set(light, $$value);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	var node_5 = $.sibling(node_1, 2);

	TransformControls(node_5, {
		mode: 'scale',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					receiveShadow: true,
					scale: 20,
					'position.z': -5,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_7 = $.first_child(fragment_4);

						BackdropGeometry(node_7, {
							get length() {
								return $$props.length;
							},

							get segments() {
								return $$props.segments;
							}
						});

						var node_8 = $.sibling(node_7, 2);

						$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, {
								get color() {
									return materialColor();
								},

								get wireframe() {
									return materialWireframe();
								},
								receiveShadow: true,
								roughness: 0.4,
								metalness: 0.1
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

	var node_9 = $.sibling(node_5, 2);

	$.await(node_9, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { scene } = $.get($$source);

			return { scene };
		});

		var scene = $.derived(() => $.get($$value).scene);

		Bounds($$anchor, {
			margin: 0.5,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = $.comment();
				var node_10 = $.first_child(fragment_6);

				$.each(node_10, 16, () => ({ length: 3 }), $.index, ($$anchor, $$item, index) => {
					var fragment_7 = $.comment();
					var node_11 = $.first_child(fragment_7);

					{
						let $0 = $.derived(() => Math.cos(index * MathUtils.degToRad(120)) * 4);
						let $1 = $.derived(() => Math.sin(index * MathUtils.degToRad(120)) * 4);

						$.component(node_11, () => T.Group, ($$anchor, T_Group) => {
							T_Group($$anchor, {
								scale: 2,
								get 'position.z'() {
									return $.get($0);
								},

								get 'position.x'() {
									return $.get($1);
								},
								'position.y': -0,
								'rotation.y': Math.PI,
								oncreate: (ref) => {
									ref.lookAt(0, -0.2, 0);
								},

								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => $.get(scene).clone());

										T($$anchor, {
											get is() {
												return $.get($0);
											},
											'rotation.y': -Math.PI / 2,
											oncreate: (ref) => {
												ref.traverse((child) => {
													child.castShadow = true;
													child.receiveShadow = true;
													console.log(child);

													if (isInstanceOf(child, 'Mesh')) {
														const material = child.material;

														if (isInstanceOf(material, 'MeshStandardMaterial')) {
															material.roughness = 0.1;
														}
													}
												});
											}
										});
									}
								},
								$$slots: { default: true }
							});
						});
					}

					$.append($$anchor, fragment_7);
				});

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	var node_12 = $.sibling(node_9, 2);

	$.component(node_12, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.x': -30,
			'position.y': 5,
			'position.z': 10,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					enableDamping: true,
					maxPolarAngle: 0.5 * Math.PI,
					minAzimuthAngle: -1 * 0.25 * Math.PI,
					maxAzimuthAngle: 0.25 * Math.PI,
					children: ($$anchor, $$slotProps) => {
						Gizmo($$anchor, {});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}