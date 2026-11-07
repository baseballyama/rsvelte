import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import Character from './Character.svelte';
import { InstancedMesh, Instance, Wireframe, Outlines, Float } from '@threlte/extras';
import { Vector3, Quaternion } from 'three';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let boxes = $.state(void 0);
	const numCubes = 70;

	useTask((delta) => {
		if ($.get(boxes)) $.get(boxes).rotation.y += delta / 60;
	});

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [-0.8, 1.2, 1.7],
			oncreate: (ref) => {
				ref.lookAt(0, 1, 0);
			}
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [10, 5, 5], castShadow: true });
	});

	var node_3 = $.sibling(node_2, 2);

	Character(node_3, {
		get wireframeProps() {
			return $$props.wireframeProps;
		}
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'rotation.x': -90 * (Math.PI / 180),
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_5 = $.first_child(fragment_1);

				$.component(node_5, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [3, 72] });
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white' });
				});

				var node_7 = $.sibling(node_6, 2);

				Outlines(node_7, { color: 'red', thickness: 10 });
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_4, 2);

	InstancedMesh(node_8, {
		castShadow: true,
		get ref() {
			return $.get(boxes);
		},

		set ref($$value) {
			$.set(boxes, $$value);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_9 = $.first_child(fragment_2);

			$.component(node_9, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
				T_BoxGeometry($$anchor, { args: [0.07, 0.07, 0.07] });
			});

			var node_10 = $.sibling(node_9, 2);

			$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
				T_MeshStandardMaterial_1($$anchor, {});
			});

			var node_11 = $.sibling(node_10, 2);

			Wireframe(node_11, $.spread_props(() => $$props.wireframeProps));

			var node_12 = $.sibling(node_11, 2);

			$.each(node_12, 17, () => ({ length: numCubes }), $.index, ($$anchor, $$item, index) => {
				const height = $.derived(() => new Vector3(0, 1.2, 0));
				const position = $.derived(() => new Vector3().randomDirection().add($.get(height)).toArray());
				const quaternion = $.derived(() => new Quaternion().random().toArray());
				const scale = $.derived(() => new Vector3().randomDirection().multiplyScalar(2).toArray());

				Float($$anchor, {
					seed: Math.random() * index,
					children: ($$anchor, $$slotProps) => {
						Instance($$anchor, {
							get position() {
								return $.get(position);
							},

							get quaternion() {
								return $.get(quaternion);
							},

							get scale() {
								return $.get(scale);
							}
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}