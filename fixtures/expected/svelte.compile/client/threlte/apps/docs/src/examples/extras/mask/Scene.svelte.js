import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { OrbitControls, Grid, Float, TransformControls, Mask, useMask } from '@threlte/extras';
import { Pane, Checkbox, List } from 'svelte-tweakpane-ui';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let inverse = $.state(true);
	let move = $.state(false);
	let id = $.state(1);
	const torusStencil = $.derived(() => useMask(1, $.get(inverse)));
	const boxStencil = $.derived(() => useMask(2, $.get(inverse)));
	const icoStencil = $.derived(() => useMask(3, $.get(inverse)));
	var fragment = root_2();
	var node = $.first_child(fragment);

	Pane(node, {
		title: 'Mask',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Checkbox(node_1, {
				label: 'inverse',
				get value() {
					return $.get(inverse);
				},

				set value($$value) {
					$.set(inverse, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			List(node_2, {
				label: 'target',
				options: { torus: 1, box: 2, ico: 3 },
				get value() {
					return $.get(id);
				},

				set value($$value) {
					$.set(id, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Checkbox(node_3, {
				label: 'move',
				get value() {
					return $.get(move);
				},

				set value($$value) {
					$.set(move, $$value, true);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	$.component(node_4, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [3, 4, 15],
			fov: 15,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, { enableDamping: true, target: [0, 0.5, 0] });
			},
			$$slots: { default: true }
		});
	});

	var node_5 = $.sibling(node_4, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let ref = () => ($$arg0?.()).ref;
			var fragment_3 = root();
			var node_6 = $.first_child(fragment_3);

			Mask(node_6, {
				get id() {
					return $.get(id);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_7 = $.first_child(fragment_4);

					$.component(node_7, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
						T_CircleGeometry($$anchor, { args: [0.65] });
					});

					var node_8 = $.sibling(node_7, 2);

					$.component(node_8, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
						T_MeshBasicMaterial($$anchor, {});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_6, 2);

			$.component(node_9, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_10 = $.first_child(fragment_5);

						$.component(node_10, () => T.RingGeometry, ($$anchor, T_RingGeometry) => {
							T_RingGeometry($$anchor, { args: [0.6, 0.7, 50] });
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
							T_MeshBasicMaterial_1($$anchor, {});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_9, 2);

			{
				var consequent = ($$anchor) => {
					TransformControls($$anchor, {
						get object() {
							return ref();
						},
						showZ: false
					});
				};

				$.if(node_12, ($$render) => {
					if ($.get(move)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.component(node_5, () => T.Group, ($$anchor, T_Group) => {
			T_Group($$anchor, { position: [0, 1, 2], children, $$slots: { default: true } });
		});
	}

	var node_13 = $.sibling(node_5, 2);

	$.component(node_13, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { intensity: 3, 'position.x': 5, 'position.y': 10 });
	});

	var node_14 = $.sibling(node_13, 2);

	$.component(node_14, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.6 });
	});

	var node_15 = $.sibling(node_14, 2);

	Grid(node_15, {
		gridSize: [8, 8],
		cellColor: '#46536b',
		'position.y': -0.3,
		sectionThickness: 0,
		fadeDistance: 50
	});

	var node_16 = $.sibling(node_15, 2);

	Float(node_16, {
		floatIntensity: 1,
		floatingRange: [0, 1],
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = $.comment();
			var node_17 = $.first_child(fragment_7);

			$.component(node_17, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					position: [0, 0.3, 0],
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root_1();
						var node_18 = $.first_child(fragment_8);

						$.component(node_18, () => T.TorusKnotGeometry, ($$anchor, T_TorusKnotGeometry) => {
							T_TorusKnotGeometry($$anchor, { args: [0.5, 0.15, 100, 12, 2, 3] });
						});

						var node_19 = $.sibling(node_18, 2);

						$.component(node_19, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, $.spread_props({ color: '#F85122' }, () => $.get(torusStencil)));
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_16, 2);

	Float(node_20, {
		floatIntensity: 1,
		floatingRange: [0, 0.5],
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = $.comment();
			var node_21 = $.first_child(fragment_9);

			$.component(node_21, () => T.Mesh, ($$anchor, T_Mesh_2) => {
				T_Mesh_2($$anchor, {
					'position.y': 0.5,
					position: [-1.5, 0, -2],
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = root_1();
						var node_22 = $.first_child(fragment_10);

						$.component(node_22, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
							T_BoxGeometry($$anchor, {});
						});

						var node_23 = $.sibling(node_22, 2);

						$.component(node_23, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, $.spread_props({ color: '#0059BA' }, () => $.get(boxStencil)));
						});

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_20, 2);

	Float(node_24, {
		floatIntensity: 1,
		floatingRange: [0, 0.5],
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = $.comment();
			var node_25 = $.first_child(fragment_11);

			$.component(node_25, () => T.Mesh, ($$anchor, T_Mesh_3) => {
				T_Mesh_3($$anchor, {
					position: [1.5, 0.3, -2],
					scale: 0.8,
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = root_1();
						var node_26 = $.first_child(fragment_12);

						$.component(node_26, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
							T_IcosahedronGeometry($$anchor, {});
						});

						var node_27 = $.sibling(node_26, 2);

						$.component(node_27, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
							T_MeshStandardMaterial_2($$anchor, $.spread_props({ color: '#F8EBCE' }, () => $.get(icoStencil)));
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}