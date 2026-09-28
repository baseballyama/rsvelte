import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OrbitControls } from '@threlte/extras';
import { T } from '@threlte/core';
import { interactivity, meshBounds } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let showBounds = $.prop($$props, 'showBounds', 3, false);

	interactivity();

	const positions = [[0, 1, 0], [1, -1, 0], [-1, -1, 0]];

	class BoundsItem {
		#wireframe = $.state(true);

		get wireframe() {
			return $.get(this.#wireframe);
		}

		set wireframe(value) {
			$.set(this.#wireframe, value, true);
		}

		position;

		constructor(position) {
			this.position = position;
		}
	}

	const boundsItems = positions.map((position) => {
		return new BoundsItem(position);
	});

	const size = 1;

	// half of the box's diagonal === radius of the bounding sphere
	const radius = 0.5 * size * Math.sqrt(3);

	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.z': 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_2 = $.sibling(node_1, 2);

	$.each(node_2, 17, () => boundsItems, $.index, ($$anchor, boundsItem, $$index) => {
		var fragment_2 = $.comment();
		var node_3 = $.first_child(fragment_2);

		$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get raycast() {
					return meshBounds;
				},

				onpointerenter: () => {
					($.get(boundsItem).wireframe = false);
				},

				onpointerleave: () => {
					($.get(boundsItem).wireframe = true);
				},

				get position() {
					return $.get(boundsItem).position;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
						T_BoxGeometry($$anchor, { args: [size, size, size] });
					});

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, {
							color: 'hotpink',
							get wireframe() {
								return $.get(boundsItem).wireframe;
							}
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_2);
	});

	var node_6 = $.sibling(node_2, 2);

	$.component(node_6, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			get visible() {
				return showBounds();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_7 = $.first_child(fragment_4);

				$.each(node_7, 17, () => positions, $.index, ($$anchor, position) => {
					var fragment_5 = $.comment();
					var node_8 = $.first_child(fragment_5);

					$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							get position() {
								return $.get(position);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_9 = $.first_child(fragment_6);

								$.component(node_9, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
									T_SphereGeometry($$anchor, { args: [radius] });
								});

								var node_10 = $.sibling(node_9, 2);

								$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
									T_MeshStandardMaterial_1($$anchor, { transparent: true, opacity: 0.25 });
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}