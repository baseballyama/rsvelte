import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { AutoColliders } from '@threlte/rapier';

var root = $.from_html(`<!> <!>`, 1);

export default function Start($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get position() {
				return $$props.position;
			},

			get rotation() {
				return $$props.rotation;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children);

				var node_2 = $.sibling(node_1, 2);

				AutoColliders(node_2, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
							T_Mesh($$anchor, {
								position: [0, -1.1, 0],
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
										T_BoxGeometry($$anchor, {});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
										T_MeshStandardMaterial($$anchor, { color: 'red' });
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}