import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MathUtils } from 'three';
import { T, useTask } from '@threlte/core';
import { injectLookAtPlugin } from './lookAtPlugin.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let cubePos = $.state([0, 0.8, 0]);
	let time = 0;
	const radius = 2;

	useTask((dt) => {
		$.set(cubePos, [radius * Math.sin(time), 0.8, radius * Math.cos(time)]);
		time += dt;
	});

	injectLookAtPlugin();

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, {
			zoom: 80,
			position: [0, 5, 10],
			makeDefault: true,
			lookAt: [0, 2, 0]
		});
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => MathUtils.DEG2RAD * -90);

		$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				receiveShadow: true,
				get 'rotation.x'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, { args: [4, 60] });
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, {});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_4 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => MathUtils.DEG2RAD * -90);

		$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
			T_Mesh_1($$anchor, {
				get position() {
					return $.get(cubePos);
				},
				receiveShadow: true,
				castShadow: true,
				get 'rotation.x'() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_5 = $.first_child(fragment_2);

					$.component(node_5, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
						T_BoxGeometry($$anchor, {});
					});

					var node_6 = $.sibling(node_5, 2);

					$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
						T_MeshStandardMaterial_1($$anchor, { color: '#FE3D00' });
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});
	}

	var node_7 = $.sibling(node_4, 2);

	$.component(node_7, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get lookAt() {
				return $.get(cubePos);
			},
			position: [0, 4, 0],
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_8 = $.first_child(fragment_3);

				{
					let $0 = $.derived(() => MathUtils.DEG2RAD * 90);

					$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_2) => {
						T_Mesh_2($$anchor, {
							receiveShadow: true,
							castShadow: true,
							get 'rotation.x'() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root();
								var node_9 = $.first_child(fragment_4);

								$.component(node_9, () => T.ConeGeometry, ($$anchor, T_ConeGeometry) => {
									T_ConeGeometry($$anchor, { args: [1, 2] });
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
									T_MeshStandardMaterial_2($$anchor, { color: '#FE3D00', flatShading: true });
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	var node_11 = $.sibling(node_7, 2);

	$.component(node_11, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [-3, 20, -10], intensity: 1, castShadow: true });
	});

	var node_12 = $.sibling(node_11, 2);

	$.component(node_12, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	$.append($$anchor, fragment);
	$.pop();
}