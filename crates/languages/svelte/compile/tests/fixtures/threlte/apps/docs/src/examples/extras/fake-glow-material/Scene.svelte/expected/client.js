import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, Grid, FakeGlowMaterial } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.component(node, () => T.Group, ($$anchor, T_Group) => {
		T_Group($$anchor, {
			'position.y': 2,
			'position.x': -3,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
					T_Mesh($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
								T_MeshBasicMaterial($$anchor, { color: 'green' });
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
								T_IcosahedronGeometry($$anchor, { args: [2, 4] });
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh_1) => {
					T_Mesh_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							FakeGlowMaterial(node_5, {});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry_1) => {
								T_IcosahedronGeometry_1($$anchor, { args: [4, 4] });
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node, 2);

	$.component(node_7, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			'position.y': 3,
			'position.x': 3,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_8 = $.first_child(fragment_4);

				$.component(node_8, () => T.Mesh, ($$anchor, T_Mesh_2) => {
					T_Mesh_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_9 = $.first_child(fragment_5);

							$.component(node_9, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
								T_MeshBasicMaterial_1($$anchor, { color: 'blue' });
							});

							var node_10 = $.sibling(node_9, 2);

							$.component(node_10, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
								T_BoxGeometry($$anchor, { args: [2, 2, 2] });
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_8, 2);

				$.component(node_11, () => T.Mesh, ($$anchor, T_Mesh_3) => {
					T_Mesh_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_12 = $.first_child(fragment_6);

							FakeGlowMaterial(node_12, { glowColor: 'blue' });

							var node_13 = $.sibling(node_12, 2);

							$.component(node_13, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry_2) => {
								T_IcosahedronGeometry_2($$anchor, { args: [3, 4] });
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var node_14 = $.sibling(node_7, 2);

	$.component(node_14, () => T.Group, ($$anchor, T_Group_2) => {
		T_Group_2($$anchor, {
			'position.y': 6,
			'position.x': 0,
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root();
				var node_15 = $.first_child(fragment_7);

				$.component(node_15, () => T.Mesh, ($$anchor, T_Mesh_4) => {
					T_Mesh_4($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = root();
							var node_16 = $.first_child(fragment_8);

							$.component(node_16, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_2) => {
								T_MeshBasicMaterial_2($$anchor, { color: 'red' });
							});

							var node_17 = $.sibling(node_16, 2);

							$.component(node_17, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
								T_TorusKnotGeometry($$anchor, { args: [1, 0.25, 128] });
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_18 = $.sibling(node_15, 2);

				$.component(node_18, () => T.Mesh, ($$anchor, T_Mesh_5) => {
					T_Mesh_5($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = root();
							var node_19 = $.first_child(fragment_9);

							FakeGlowMaterial(node_19, { glowColor: 'red' });

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry_1) => {
								T_TorusKnotGeometry_1($$anchor, { args: [1, 0.8, 128] });
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	var node_21 = $.sibling(node_14, 2);

	$.component(node_21, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
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

	var node_22 = $.sibling(node_21, 2);

	Grid(node_22, {
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