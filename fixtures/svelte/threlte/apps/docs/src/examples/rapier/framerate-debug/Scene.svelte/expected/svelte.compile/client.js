import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Attractor, AutoColliders, RigidBody } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	let rb = $.state(void 0);
	var fragment = root_1();

	$.event('keydown', $.window, (e) => {
		if (e.key === 'p') {
			if (!$.get(rb)) return;

			const x = Math.random() * 3 - 1.5;
			const y = Math.random() * 3 - 1.5;
			const z = Math.random() * 3 - 1.5;

			$.get(rb).setNextKinematicTranslation({ x, y, z });
		}
	});

	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [3, 3, 3],
			oncreate: (ref) => ref.lookAt(0, 0, 0.3)
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			position: [0, 0, 0],
			children: ($$anchor, $$slotProps) => {
				RigidBody($$anchor, {
					type: 'dynamic',
					get rigidBody() {
						return $.get(rb);
					},

					set rigidBody($$value) {
						$.set(rb, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						AutoColliders($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
									T_Mesh($$anchor, {
										castShadow: true,
										receiveShadow: true,
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
												T_MeshStandardMaterial($$anchor, { color: 'red', transparent: true, opacity: 0.4 });
											});

											var node_4 = $.sibling(node_3, 2);

											$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
												T_BoxGeometry($$anchor, {});
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
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_1, 2);

	Attractor(node_5, {
		position: [0, 0, 0.3],
		strength: 0.2,
		range: 2,
		gravityType: 'linear'
	});

	var node_6 = $.sibling(node_5, 2);

	$.component(node_6, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			position: [4, 10, 0],
			castShadow: true,
			'shadow.mapSize': 1024,
			'shadow.camera.left': -10,
			'shadow.camera.right': 10,
			'shadow.camera.top': 10,
			'shadow.camera.bottom': -10
		});
	});

	$.append($$anchor, fragment);
}