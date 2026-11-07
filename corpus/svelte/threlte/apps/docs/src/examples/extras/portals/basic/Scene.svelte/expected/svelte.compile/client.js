import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Grid, OrbitControls, Portal, PortalTarget } from '@threlte/extras';
import { MathUtils } from 'three';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let posX = $.state(Math.sin(Date.now() / 1000) * 4);

	useTask(() => {
		$.set(posX, Math.sin(Date.now() / 1000) * 4);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			position: [10, 10, 10],
			makeDefault: true,
			fov: 30,
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => 85 * MathUtils.DEG2RAD);
					let $1 = $.derived(() => 20 * MathUtils.DEG2RAD);
					let $2 = $.derived(() => 45 * MathUtils.DEG2RAD);
					let $3 = $.derived(() => -45 * MathUtils.DEG2RAD);

					OrbitControls($$anchor, {
						get maxPolarAngle() {
							return $.get($0);
						},

						get minPolarAngle() {
							return $.get($1);
						},

						get maxAzimuthAngle() {
							return $.get($2);
						},

						get minAzimuthAngle() {
							return $.get($3);
						},
						enableZoom: false
					});
				}
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Grid(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 10, 3] });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.Object3D, ($$anchor, T_Object3D) => {
		T_Object3D($$anchor, {
			get 'position.x'() {
				return $.get(posX);
			},
			'position.y': 0.5,
			children: ($$anchor, $$slotProps) => {
				PortalTarget($$anchor, { id: 'trail' });
			},
			$$slots: { default: true }
		});
	});

	var node_4 = $.sibling(node_3, 2);

	Portal(node_4, {
		id: 'trail',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_5 = $.first_child(fragment_3);

			$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
							T_BoxGeometry($$anchor, {});
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, { color: '#FE3D00' });
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});
			});

			var node_8 = $.sibling(node_5, 2);

			$.component(node_8, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					'position.y': 1,
					children: ($$anchor, $$slotProps) => {
						PortalTarget($$anchor, { id: 'top' });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_4, 2);

	Portal(node_9, {
		id: 'top',
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = $.comment();
			var node_10 = $.first_child(fragment_6);

			$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_11 = $.first_child(fragment_7);

						$.component(node_11, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
							T_BoxGeometry_1($$anchor, {});
						});

						var node_12 = $.sibling(node_11, 2);

						$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, { color: '#2F7DC6' });
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}