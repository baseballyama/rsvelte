import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FallingShapes from './FallingShapes.svelte';
import RAPIER from '@dimforge/rapier3d-compat';
import { Collider, Debug, RigidBody } from '@threlte/rapier';
import { DoubleSide, PlaneGeometry, MathUtils } from 'three';
import { Environment, OrbitControls, Suspense } from '@threlte/extras';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let resetCounter = $.prop($$props, 'resetCounter', 3, 0),
		showDebug = $.prop($$props, 'showDebug', 3, false);

	const nsubdivs = 10;
	const size = 10;
	const heights = [];
	const geometry = new PlaneGeometry(size, size, nsubdivs, nsubdivs);
	const noise = new SimplexNoise();
	const positions = geometry.getAttribute('position').array;

	for (let x = 0; x <= nsubdivs; x++) {
		for (let y = 0; y <= nsubdivs; y++) {
			const height = noise.noise(x / 4, y / 4);
			const vertIndex = (x + (nsubdivs + 1) * y) * 3;

			positions[vertIndex + 2] = height;

			const heightIndex = y + (nsubdivs + 1) * x;

			heights[heightIndex] = height;
		}
	}

	// needed for lighting
	geometry.computeVertexNormals();

	const scale = new RAPIER.Vector3(size, 1, size);
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.y': 10,
			'position.z': 10,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Suspense(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_2 = $.first_child(fragment_2);

			$.key(node_2, resetCounter, ($$anchor) => {
				{
					const children = ($$anchor, $$arg0) => {
						let shape = () => ($$arg0?.()).shape;
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								castShadow: true,
								receiveShadow: true,
								get geometry() {
									return shape().geometry;
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, {
											get color() {
												return shape().color;
											}
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					};

					FallingShapes($$anchor, { children, $$slots: { default: true } });
				}
			});

			var node_5 = $.sibling(node_2, 2);

			Environment(node_5, {
				url: '/textures/equirectangular/hdr/shanghai_riverside_1k.hdr'
			});

			var node_6 = $.sibling(node_5, 2);

			$.component(node_6, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
				T_DirectionalLight($$anchor, { castShadow: true, position: [5, 5, 5] });
			});

			var node_7 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => MathUtils.DEG2RAD * -90);

				$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						receiveShadow: true,
						get geometry() {
							return geometry;
						},

						get 'rotation.x'() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_8 = $.first_child(fragment_6);

							$.component(node_8, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
								T_MeshStandardMaterial_1($$anchor, {
									color: 'teal',
									opacity: 0.8,
									transparent: true,
									get side() {
										return DoubleSide;
									}
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});
			}

			var node_9 = $.sibling(node_7, 2);

			RigidBody(node_9, {
				type: 'fixed',
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => [nsubdivs, nsubdivs, new Float32Array(heights), scale]);

						Collider($$anchor, {
							shape: 'heightfield',
							get args() {
								return $.get($0);
							}
						});
					}
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			{
				var consequent = ($$anchor) => {
					Debug($$anchor, {});
				};

				$.if(node_10, ($$render) => {
					if (showDebug()) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}