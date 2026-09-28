import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OrbitControls, Grid, Billboard } from '@threlte/extras';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	let follow = $.prop($$props, 'follow', 3, true);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Billboard(node, {
		get follow() {
			return follow();
		},
		position: [3, 1, 0],
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
							T_MeshBasicMaterial($$anchor, { color: 'red' });
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
							T_PlaneGeometry($$anchor, { args: [2, 3] });
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

	var node_4 = $.sibling(node, 2);

	Billboard(node_4, {
		get follow() {
			return follow();
		},
		position: [-4, 3, 0],
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = $.comment();
			var node_5 = $.first_child(fragment_3);

			$.component(node_5, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_6 = $.first_child(fragment_4);

						$.component(node_6, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
							T_MeshBasicMaterial_1($$anchor, { color: 'green' });
						});

						var node_7 = $.sibling(node_6, 2);

						$.component(node_7, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
							T_PlaneGeometry_1($$anchor, { args: [3, 2] });
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

	var node_8 = $.sibling(node_4, 2);

	Billboard(node_8, {
		get follow() {
			return follow();
		},
		position: [-1, 5, 2],
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = $.comment();
			var node_9 = $.first_child(fragment_5);

			$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_2) => {
				T_Mesh_2($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root();
						var node_10 = $.first_child(fragment_6);

						$.component(node_10, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_2) => {
							T_MeshBasicMaterial_2($$anchor, { color: 'blue' });
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_2) => {
							T_PlaneGeometry_2($$anchor, { args: [2, 2] });
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_8, 2);

	$.component(node_12, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			'position.y': 8,
			'position.z': 8,
			fov: 90,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, enablePan: false, enableZoom: false });
			},
			$$slots: { default: true }
		});
	});

	var node_13 = $.sibling(node_12, 2);

	Grid(node_13, {
		'position.y': 0,
		sectionThickness: 1,
		infiniteGrid: true,
		cellColor: '#dddddd',
		sectionColor: '#ffffff',
		sectionSize: 10,
		cellSize: 2
	});

	$.append($$anchor, fragment);
}