import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useStage, useThrelte } from '@threlte/core';

import {
	Align,
	Edges,
	Grid,
	MeshDiscardMaterial,
	OrbitControls,
	Resize
} from '@threlte/extras';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	// Create the stages for resizing and aligning
	const { renderStage, mainStage } = useThrelte();

	// Resizing must happen *before* aligning, so we need to create a new stage to orchestrate this
	const resizeStage = useStage(Symbol('resize'), { after: mainStage, before: renderStage });

	// Aligning must happen *after* resizing, to take the new size into account
	const alignStage = useStage(Symbol('align'), { after: resizeStage, before: renderStage });

	var fragment = root_2();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: 5,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { position: [5, 10, 4], intensity: Math.PI });
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	var node_3 = $.sibling(node_2, 2);

	Grid(node_3, {
		cellColor: '#1F3153',
		cellSize: 0.5,
		sectionColor: '#1F3153',
		sectionThickness: 3
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			'position.y': 0.5,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_5 = $.first_child(fragment_2);

				MeshDiscardMaterial(node_5, {});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
					T_BoxGeometry($$anchor, {});
				});

				var node_7 = $.sibling(node_6, 2);

				Edges(node_7, { color: 'white' });
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_4, 2);

	Align(node_8, {
		get stage() {
			return alignStage;
		},
		y: 1,
		auto: true,
		children: ($$anchor, $$slotProps) => {
			Resize($$anchor, {
				get stage() {
					return resizeStage;
				},

				get auto() {
					return $$props.auto;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root();
					var node_9 = $.first_child(fragment_4);

					$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_5 = root_1();
								var node_10 = $.first_child(fragment_5);

								$.component(node_10, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
									T_MeshStandardMaterial($$anchor, { color: 'hotpink' });
								});

								var node_11 = $.sibling(node_10, 2);

								$.component(node_11, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
									T_BoxGeometry_1($$anchor, {});
								});

								$.append($$anchor, fragment_5);
							},
							$$slots: { default: true }
						});
					});

					var node_12 = $.sibling(node_9, 2);

					$.component(node_12, () => T.Mesh, ($$anchor, T_Mesh_2) => {
						T_Mesh_2($$anchor, {
							'position.y': 1.5,
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_13 = $.first_child(fragment_6);

								$.component(node_13, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
									T_MeshStandardMaterial_1($$anchor, { color: 'cyan' });
								});

								var node_14 = $.sibling(node_13, 2);

								$.component(node_14, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
									T_SphereGeometry($$anchor, {});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					var node_15 = $.sibling(node_12, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_7 = $.comment();
							var node_16 = $.first_child(fragment_7);

							$.component(node_16, () => T.Mesh, ($$anchor, T_Mesh_3) => {
								T_Mesh_3($$anchor, {
									'position.y': 3,
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_1();
										var node_17 = $.first_child(fragment_8);

										$.component(node_17, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
											T_MeshStandardMaterial_2($$anchor, { color: 'yellow' });
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
											T_CylinderGeometry($$anchor, { args: [1, 1.5, 1] });
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						};

						$.if(node_15, ($$render) => {
							if ($$props.showCylinder) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}