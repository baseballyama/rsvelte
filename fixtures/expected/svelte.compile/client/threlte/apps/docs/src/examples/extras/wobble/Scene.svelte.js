import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

import {
	Wobble,
	Environment,
	Instance,
	InstancedMesh,
	OrbitControls,
	RadialGradientTexture,
	useGltf,
	SoftShadows,
	Wireframe
} from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $plantGltf = () => $.store_get(plantGltf, '$plantGltf', $$stores);
	const $flowerGltf = () => $.store_get(flowerGltf, '$flowerGltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let subject = $.prop($$props, 'subject', 3, 'plant'),
		speed = $.prop($$props, 'speed', 3, 1),
		factor = $.prop($$props, 'factor', 3, 0.5),
		frequency = $.prop($$props, 'frequency', 3, 1),
		noise = $.prop($$props, 'noise', 3, 0),
		pulse = $.prop($$props, 'pulse', 3, 0),
		drift = $.prop($$props, 'drift', 3, 0),
		bendiness = $.prop($$props, 'bendiness', 3, 0),
		axis = $.prop($$props, 'axis', 19, () => [0, 1, 0]);

	const plantGltf = useGltf('/models/rhyzome_plant-baked.glb');
	const flowerGltf = useGltf('/models/Flower.glb');

	// Scattered flower placements.
	const flowerPlacements = Array.from({ length: 20 }, (_, i) => {
		const angle = i / 10 * Math.PI * 2 + Math.random() * 0.4;
		const radius = 0.3 + Math.random();

		return {
			x: Math.cos(angle) * radius,
			z: Math.sin(angle) * radius,
			scale: 2 + Math.random() * 1.5,
			rotation: Math.random() * Math.PI * 2
		};
	});

	var fragment = root_3();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { makeDefault: true, position: [0, 7, 7], fov: 35 });
	});

	var node_1 = $.sibling(node, 2);

	OrbitControls(node_1, { enableDamping: true, enableZoom: false, 'target.y': 1.7 });

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [1, 5, 1],
			intensity: 4,
			castShadow: true,
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.camera.left': -4,
			'shadow.camera.right': 4,
			'shadow.camera.top': 4,
			'shadow.camera.bottom': -4,
			'shadow.camera.near': 0.5,
			'shadow.camera.far': 20
		});
	});

	var node_3 = $.sibling(node_2, 2);

	Environment(node_3, {
		url: '/textures/equirectangular/hdr/industrial_sunset_puresky_1k.hdr'
	});

	var node_4 = $.sibling(node_3, 2);

	SoftShadows(node_4, { size: 10, samples: 10, focus: 1.5 });

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'rotation.x': -Math.PI / 2,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_6 = $.first_child(fragment_1);

				$.component(node_6, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [6, 64] });
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, {
						transparent: true,
						roughness: 0,
						children: ($$anchor, $$slotProps) => {
							RadialGradientTexture($$anchor, {
								outerRadius: 256,
								stops: [
									{ offset: 0, color: 'white' },
									{ offset: 0.7, color: 'rgba(255, 255, 255, 0)' }
								]
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

	var node_8 = $.sibling(node_5, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_3 = root();
			var node_9 = $.first_child(fragment_3);

			$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					castShadow: true,
					receiveShadow: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_10 = $.first_child(fragment_4);

						T(node_10, {
							get is() {
								return $plantGltf().nodes.concrete_pot_lambert3_0.geometry;
							}
						});

						var node_11 = $.sibling(node_10, 2);

						T(node_11, {
							get is() {
								return $plantGltf().materials.lambert3;
							}
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_9, 2);

			$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_2) => {
				T_Mesh_2($$anchor, {
					castShadow: true,
					receiveShadow: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_13 = $.first_child(fragment_5);

						T(node_13, {
							get is() {
								return $plantGltf().nodes.plant_lambert2_0.geometry;
							}
						});

						var node_14 = $.sibling(node_13, 2);

						T(node_14, {
							get is() {
								return $plantGltf().materials.lambert2;
							},
							roughness: 0.4
						});

						var node_15 = $.sibling(node_14, 2);

						Wobble(node_15, {
							get speed() {
								return speed();
							},

							get factor() {
								return factor();
							},

							get frequency() {
								return frequency();
							},

							get noise() {
								return noise();
							},

							get pulse() {
								return pulse();
							},

							get drift() {
								return drift();
							},

							get bendiness() {
								return bendiness();
							},

							get axis() {
								return axis();
							},

							get anchor() {
								return $$props.anchor;
							},

							get forceDirection() {
								return $$props.forceDirection;
							},

							get time() {
								return $$props.time;
							}
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_6 = $.comment();
			var node_16 = $.first_child(fragment_6);

			$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_3) => {
				T_Mesh_3($$anchor, {
					'position.y': 1.5,
					castShadow: true,
					receiveShadow: true,
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_2();
						var node_17 = $.first_child(fragment_7);

						$.component(node_17, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
							T_SphereGeometry($$anchor, { args: [1, 32, 32] });
						});

						var node_18 = $.sibling(node_17, 2);

						$.component(node_18, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, { color: '#ff7755', roughness: 0.1 });
						});

						var node_19 = $.sibling(node_18, 2);

						Wobble(node_19, {
							get speed() {
								return speed();
							},

							get factor() {
								return factor();
							},

							get frequency() {
								return frequency();
							},

							get noise() {
								return noise();
							},

							get pulse() {
								return pulse();
							},

							get drift() {
								return drift();
							},

							get bendiness() {
								return bendiness();
							},

							get axis() {
								return axis();
							},

							get anchor() {
								return $$props.anchor;
							},

							get forceDirection() {
								return $$props.forceDirection;
							},

							get time() {
								return $$props.time;
							}
						});

						var node_20 = $.sibling(node_19, 2);

						Wireframe(node_20, {});
						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		};

		var consequent_2 = ($$anchor) => {
			var fragment_8 = root();
			var node_21 = $.first_child(fragment_8);

			InstancedMesh(node_21, {
				castShadow: true,
				receiveShadow: true,
				get limit() {
					return flowerPlacements.length;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_2();
					var node_22 = $.first_child(fragment_9);

					T(node_22, {
						get is() {
							return $flowerGltf().nodes.Stem.geometry;
						}
					});

					var node_23 = $.sibling(node_22, 2);

					$.component(node_23, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
						T_MeshStandardMaterial_2($$anchor, { color: '#3d7a3a' });
					});

					var node_24 = $.sibling(node_23, 2);

					Wobble(node_24, {
						get speed() {
							return speed();
						},

						get factor() {
							return factor();
						},

						get frequency() {
							return frequency();
						},

						get noise() {
							return noise();
						},

						get pulse() {
							return pulse();
						},

						get drift() {
							return drift();
						},

						get bendiness() {
							return bendiness();
						},

						get axis() {
							return axis();
						},

						get anchor() {
							return $$props.anchor;
						},

						get forceDirection() {
							return $$props.forceDirection;
						},

						get time() {
							return $$props.time;
						}
					});

					var node_25 = $.sibling(node_24, 2);

					$.each(node_25, 17, () => flowerPlacements, $.index, ($$anchor, f) => {
						Instance($$anchor, {
							get 'position.x'() {
								return $.get(f).x;
							},

							get 'position.z'() {
								return $.get(f).z;
							},

							get scale() {
								return $.get(f).scale;
							},

							get 'rotation.y'() {
								return $.get(f).rotation;
							}
						});
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_21, 2);

			InstancedMesh(node_26, {
				castShadow: true,
				receiveShadow: true,
				get limit() {
					return flowerPlacements.length;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_2();
					var node_27 = $.first_child(fragment_11);

					T(node_27, {
						get is() {
							return $flowerGltf().nodes.Blossom.geometry;
						}
					});

					var node_28 = $.sibling(node_27, 2);

					$.component(node_28, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
						T_MeshStandardMaterial_3($$anchor, { color: '#ff5599' });
					});

					var node_29 = $.sibling(node_28, 2);

					Wobble(node_29, {
						get speed() {
							return speed();
						},

						get factor() {
							return factor();
						},

						get frequency() {
							return frequency();
						},

						get noise() {
							return noise();
						},

						get pulse() {
							return pulse();
						},

						get drift() {
							return drift();
						},

						get bendiness() {
							return bendiness();
						},

						get axis() {
							return axis();
						},

						get anchor() {
							return $$props.anchor;
						},

						get forceDirection() {
							return $$props.forceDirection;
						},

						get time() {
							return $$props.time;
						}
					});

					var node_30 = $.sibling(node_29, 2);

					$.each(node_30, 17, () => flowerPlacements, $.index, ($$anchor, f) => {
						Instance($$anchor, {
							get 'position.x'() {
								return $.get(f).x;
							},

							get 'position.z'() {
								return $.get(f).z;
							},

							get scale() {
								return $.get(f).scale;
							},

							get 'rotation.y'() {
								return $.get(f).rotation;
							}
						});
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_8);
		};

		$.if(node_8, ($$render) => {
			if (subject() === 'plant' && $plantGltf()) $$render(consequent); else if (subject() === 'orb') $$render(consequent_1, 1); else if (subject() === 'flowers' && $flowerGltf()) $$render(consequent_2, 2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}