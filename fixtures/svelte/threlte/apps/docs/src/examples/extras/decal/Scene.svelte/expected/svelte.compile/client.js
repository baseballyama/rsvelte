import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DoubleSide, Vector3 } from 'three';
import { T } from '@threlte/core';

import {
	Decal,
	TransformControls,
	useTexture,
	OrbitControls,
	VirtualEnvironment,
	useSuspense
} from '@threlte/extras';

import { RigidBody as RigidBodyRef } from '@dimforge/rapier3d-compat';
import { Attractor, Collider, RigidBody } from '@threlte/rapier';

const lightformer = (
	$$anchor,
	color = $.noop,
	shape = $.noop,
	size = $.noop,
	position = $.noop
) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return position();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						oncreate: (ref) => ref.lookAt(0, 0, 0),
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									{
										let $0 = $.derived(() => [size() / 2]);

										$.component(node_3, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
											T_CircleGeometry($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_3);
								};

								var alternate = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									{
										let $0 = $.derived(() => [size(), size()]);

										$.component(node_4, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
											T_PlaneGeometry($$anchor, {
												get args() {
													return $.get($0);
												}
											});
										});
									}

									$.append($$anchor, fragment_4);
								};

								$.if(node_2, ($$render) => {
									if (shape() === 'circle') $$render(consequent); else $$render(alternate, -1);
								});
							}

							var node_5 = $.sibling(node_2, 2);

							$.component(node_5, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
								T_MeshBasicMaterial($$anchor, {
									get color() {
										return color();
									},

									get side() {
										return DoubleSide;
									}
								});
							});

							$.append($$anchor, fragment_2);
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
};

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $svelteIcon = () => $.store_get(svelteIcon, '$svelteIcon', $$stores);
	const $threlteIcon = () => $.store_get(threlteIcon, '$threlteIcon', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let controls = $.prop($$props, 'controls', 3, false),
		debug = $.prop($$props, 'debug', 3, false);

	const suspend = useSuspense();
	const svelteIcon = suspend(useTexture('/icons/svelte.png'));
	const threlteIcon = suspend(useTexture('/icons/mstile-150x150.png'));
	let bodies = $.proxy([]);
	let position = $.proxy([0.5, 0, 0.5]);
	const vec3 = new Vector3();
	var fragment_5 = root_3();
	var node_6 = $.first_child(fragment_5);

	$.component(node_6, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [5, 1, 4],
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enablePan: false, enableZoom: false, enableDamping: true });
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true, position: [5, 5, 5], intensity: 1.25 });
	});

	var node_8 = $.sibling(node_7, 2);

	Attractor(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var node_10 = $.first_child(fragment_7);

				Collider(node_10, { shape: 'ball', args: [1] });

				var node_11 = $.sibling(node_10, 2);

				$.component(node_11, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
					T_SphereGeometry($$anchor, { args: [1, 256, 128] });
				});

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { roughness: 0.1 });
				});

				var node_13 = $.sibling(node_12, 2);

				{
					var consequent_2 = ($$anchor) => {
						{
							const children = ($$anchor) => {
								var fragment_9 = root();
								var node_14 = $.first_child(fragment_9);

								$.component(node_14, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
									T_MeshStandardMaterial_1($$anchor, {
										get map() {
											return $svelteIcon();
										},
										transparent: true,
										roughness: 0.2,
										polygonOffset: true,
										polygonOffsetFactor: -10
									});
								});

								var node_15 = $.sibling(node_14, 2);

								{
									var consequent_1 = ($$anchor) => {
										TransformControls($$anchor, {
											oncreate: (ref) => {
												ref.position.fromArray(position);
											},

											onchange: (event) => {
												if (event.target.object) event.target.object.position.toArray(position);
											}
										});
									};

									$.if(node_15, ($$render) => {
										if (controls()) $$render(consequent_1);
									});
								}

								$.append($$anchor, fragment_9);
							};

							Decal($$anchor, {
								get position() {
									return position;
								},

								get debug() {
									return debug();
								},
								children,
								$$slots: { default: true }
							});
						}
					};

					$.if(node_13, ($$render) => {
						if ($svelteIcon()) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	var node_16 = $.sibling(node_9, 2);

	$.each(node_16, 16, () => ({ length: 20 }), $.index, ($$anchor, $$item, index) => {
		RigidBody($$anchor, {
			oncreate: (ref) => {
				vec3.randomDirection();
				ref.setTranslation(vec3, true);
			},

			get rigidBody() {
				return bodies[index];
			},

			set rigidBody($$value) {
				bodies[index] = $$value;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_12 = $.comment();
				var node_17 = $.first_child(fragment_12);

				$.component(node_17, () => T.Mesh, ($$anchor, T_Mesh_2) => {
					T_Mesh_2($$anchor, {
						castShadow: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = root_1();
							var node_18 = $.first_child(fragment_13);

							Collider(node_18, { shape: 'ball', args: [0.3], restitution: 0.2 });

							var node_19 = $.sibling(node_18, 2);

							$.component(node_19, () => T.SphereGeometry, ($$anchor, T_SphereGeometry_1) => {
								T_SphereGeometry_1($$anchor, { args: [0.3, 256, 128] });
							});

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
								T_MeshStandardMaterial_2($$anchor, { roughness: 0.2 });
							});

							var node_21 = $.sibling(node_20, 2);

							Decal(node_21, {
								position: [0.35, 0.35, 0.35],
								rotation: Math.PI / 4,
								scale: 1,
								depthTest: true,
								get debug() {
									return debug();
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_14 = $.comment();
									var node_22 = $.first_child(fragment_14);

									$.component(node_22, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
										T_MeshStandardMaterial_3($$anchor, {
											get map() {
												return $threlteIcon();
											},
											transparent: true,
											roughness: 0.2,
											polygonOffset: true,
											polygonOffsetFactor: -10
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_12);
			},
			$$slots: { default: true }
		});
	});

	var node_23 = $.sibling(node_16, 2);

	VirtualEnvironment(node_23, {
		frames: 10,
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_2();
			var node_24 = $.first_child(fragment_15);

			lightformer(node_24, () => '#FF4F4F', () => 'plane', () => 20, () => [0, 0, -20]);

			var node_25 = $.sibling(node_24, 2);

			lightformer(node_25, () => '#FFD0CB', () => 'circle', () => 5, () => [0, 5, 0]);

			var node_26 = $.sibling(node_25, 2);

			lightformer(node_26, () => '#2223FF', () => 'plane', () => 8, () => [-3, 0, 4]);
			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment_5);
	$.pop();
	$$cleanup();
}