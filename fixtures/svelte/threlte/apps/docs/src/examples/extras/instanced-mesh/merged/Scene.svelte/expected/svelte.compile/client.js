import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { InstancedMeshes, OrbitControls, Sky, useGltf } from '@threlte/extras';
import { DoubleSide, Mesh, MathUtils, Vector3 } from 'three';
import Flower from './Flower.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const gltf = useGltf('/models/Flower.glb');
	const vec3 = new Vector3();

	const items = Array.from({ length: 500 }, () => {
		vec3.randomDirection().multiplyScalar(2.5);

		return {
			x: vec3.x,
			z: vec3.z,
			scale: Math.random() * 0.5 + 0.5,
			rotation: {
				x: Math.random() * 8,
				y: Math.random() * 360,
				z: Math.random() * 8
			}
		};
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let Blossom = () => ($$arg0?.()).components.Blossom;
					let Stem = () => ($$arg0?.()).components.Stem;
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.each(node_1, 17, () => items, $.index, ($$anchor, item) => {
						{
							let $0 = $.derived(() => $.get(item).rotation.y * MathUtils.DEG2RAD);
							let $1 = $.derived(() => $.get(item).rotation.x * MathUtils.DEG2RAD);
							let $2 = $.derived(() => $.get(item).rotation.z * MathUtils.DEG2RAD);

							Flower($$anchor, {
								get 'position.x'() {
									return $.get(item).x;
								},

								get 'position.z'() {
									return $.get(item).z;
								},

								get scale() {
									return $.get(item).scale;
								},

								get 'rotation.y'() {
									return $.get($0);
								},

								get 'rotation.x'() {
									return $.get($1);
								},

								get 'rotation.z'() {
									return $.get($2);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root();
									var node_2 = $.first_child(fragment_4);

									$.component(node_2, Blossom, ($$anchor, Blossom_1) => {
										Blossom_1($$anchor, {});
									});

									var node_3 = $.sibling(node_2, 2);

									$.component(node_3, Stem, ($$anchor, Stem_1) => {
										Stem_1($$anchor, {});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						}
					});

					$.append($$anchor, fragment_2);
				};

				InstancedMeshes($$anchor, {
					castShadow: true,
					get meshes() {
						return $gltf().nodes;
					},

					oncreate: () => {
						$gltf().scene.traverse((child) => {
							child.castShadow = true;
							child.receiveShadow = true;
						});
					},
					children,
					$$slots: { default: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if ($gltf()) $$render(consequent);
		});
	}

	var node_4 = $.sibling(node, 2);

	$.component(node_4, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			'position.y': 3,
			'position.z': -15,
			castShadow: true,
			'shadow.camera.left': -2.5,
			'shadow.camera.right': 2.5,
			'shadow.camera.top': 2.5,
			'shadow.camera.bottom': -2.5,
			'shadow.mapSize.width': 2 ** 11,
			'shadow.mapSize.height': 2 ** 11
		});
	});

	var node_5 = $.sibling(node_4, 2);

	{
		let $0 = $.derived(() => -90 * MathUtils.DEG2RAD);

		$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				receiveShadow: true,
				get 'rotation.x'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root();
					var node_6 = $.first_child(fragment_5);

					$.component(node_6, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, { args: [2.5] });
					});

					var node_7 = $.sibling(node_6, 2);

					$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, {
							color: '#288278',
							get side() {
								return DoubleSide;
							}
						});
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_8 = $.sibling(node_5, 2);

	Sky(node_8, { elevation: 2 });

	var node_9 = $.sibling(node_8, 2);

	$.component(node_9, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.5 });
	});

	var node_10 = $.sibling(node_9, 2);

	$.component(node_10, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [0.5, 0.8, 6.2],
			makeDefault: true,
			fov: 20,
			oncreate: (ref) => ref.lookAt(0, 0.7, 0),
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					autoRotate: true,
					enableZoom: false,
					enableDamping: true,
					autoRotateSpeed: 0.1,
					enablePan: false,
					target: [0, 0.7, 0]
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}