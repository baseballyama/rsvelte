import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Color } from 'three';
import { T, useThrelte } from '@threlte/core';
import { Text, Grid, Outlines, VirtualEnvironment, Stars } from '@threlte/extras';

import {
	XR,
	useXR,
	teleportControls,
	pointerControls,
	touchControls,
	Controller,
	Hand
} from '@threlte/xr';

import Sabers from './Sabers.svelte';
import Blocks from './Blocks.svelte';
import Mountains from './Mountains.svelte';
import Menu from './Menu.svelte';
import { Spring } from 'svelte/motion';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $isPresenting = () => $.store_get(isPresenting, '$isPresenting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { scene } = useThrelte();
	const { isPresenting } = useXR();

	scene.environmentIntensity = 2;
	scene.background = new Color('#0e1625');
	teleportControls('left');
	teleportControls('right');
	pointerControls('left');
	pointerControls('right');
	touchControls('left');
	touchControls('right');

	let playing = $.state(false);
	const spring = Spring.of(() => $isPresenting() ? 0 : 1, { stiffness: 0.1, damping: 0.5 });
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		const fallback = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					position: [0, 1.8, 1],
					oncreate: (ref) => {
						ref.lookAt(0, 1.8, 0);
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		XR(node, {
			fallback,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_1();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						Sabers($$anchor, {});
					};

					var alternate = ($$anchor) => {
						var fragment_4 = root();
						var node_3 = $.first_child(fragment_4);

						Controller(node_3, { left: true });

						var node_4 = $.sibling(node_3, 2);

						Controller(node_4, { right: true });

						var node_5 = $.sibling(node_4, 2);

						Hand(node_5, { left: true });

						var node_6 = $.sibling(node_5, 2);

						Hand(node_6, { right: true });
						$.append($$anchor, fragment_4);
					};

					$.if(node_2, ($$render) => {
						if ($.get(playing)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				var node_7 = $.sibling(node_2, 2);

				Blocks(node_7, {
					get playing() {
						return $.get(playing);
					},
					oncomplete: () => $.set(playing, false)
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { fallback: true, default: true }
		});
	}

	var node_8 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Menu($$anchor, { onstart: () => $.set(playing, true) });
		};

		$.if(node_8, ($$render) => {
			if ($isPresenting() && !$.get(playing)) $$render(consequent_1);
		});
	}

	var node_9 = $.sibling(node_8, 2);

	Text(node_9, {
		anchorX: 'center',
		anchorY: 'center',
		position: [0, 1.9, 0],
		text: 'bonksaber!',
		font: '/fonts/adrip1.ttf',
		color: 'red',
		get fillOpacity() {
			return spring.current;
		},

		get strokeOpacity() {
			return spring.current;
		}
	});

	var node_10 = $.sibling(node_9, 2);

	$.component(node_10, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	var node_11 = $.sibling(node_10, 2);

	$.component(node_11, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {});
	});

	var node_12 = $.sibling(node_11, 2);

	Mountains(node_12, {});

	var node_13 = $.sibling(node_12, 2);

	Stars(node_13, {});

	var node_14 = $.sibling(node_13, 2);

	Grid(node_14, {
		infiniteGrid: true,
		cellColor: 'purple',
		type: 'lines',
		axis: 'x'
	});

	var node_15 = $.sibling(node_14, 2);

	$.component(node_15, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			teleportSurface: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_2();
				var node_16 = $.first_child(fragment_6);

				$.component(node_16, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
					T_CylinderGeometry($$anchor, { args: [2, 2, 0.1, 128] });
				});

				var node_17 = $.sibling(node_16, 2);

				$.component(node_17, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
					T_MeshStandardMaterial($$anchor, { color: 'white', roughness: 0, metalness: 0.1 });
				});

				var node_18 = $.sibling(node_17, 2);

				Outlines(node_18, { color: 'hotpink' });
				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	});

	var node_19 = $.sibling(node_15, 2);

	$.component(node_19, () => T.Mesh, ($$anchor, T_Mesh_1) => {
		T_Mesh_1($$anchor, {
			position: [-30, 40, -100],
			oncreate: (ref) => ref.lookAt(0, 0, 0),
			children: ($$anchor, $$slotProps) => {
				var fragment_7 = root_1();
				var node_20 = $.first_child(fragment_7);

				$.component(node_20, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, { color: '#FF4F4F' });
				});

				var node_21 = $.sibling(node_20, 2);

				$.component(node_21, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [5 / 2] });
				});

				$.append($$anchor, fragment_7);
			},
			$$slots: { default: true }
		});
	});

	var node_22 = $.sibling(node_19, 2);

	VirtualEnvironment(node_22, {
		frames: 20,
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_2();
			var node_23 = $.first_child(fragment_8);

			$.component(node_23, () => T.Mesh, ($$anchor, T_Mesh_2) => {
				T_Mesh_2($$anchor, {
					position: [-8, 8, -10],
					oncreate: (ref) => ref.lookAt(0, 0, 0),
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root_1();
						var node_24 = $.first_child(fragment_9);

						$.component(node_24, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_1) => {
							T_MeshBasicMaterial_1($$anchor, { color: '#FF4F4F' });
						});

						var node_25 = $.sibling(node_24, 2);

						$.component(node_25, () => T.CircleGeometry, ($$anchor, T_CircleGeometry_1) => {
							T_CircleGeometry_1($$anchor, { args: [5 / 2] });
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			});

			var node_26 = $.sibling(node_23, 2);

			$.component(node_26, () => T.Mesh, ($$anchor, T_Mesh_3) => {
				T_Mesh_3($$anchor, {
					position: [6, 8, -10],
					oncreate: (ref) => ref.lookAt(0, 0, 0),
					children: ($$anchor, $$slotProps) => {
						var fragment_10 = root_1();
						var node_27 = $.first_child(fragment_10);

						$.component(node_27, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
							T_PlaneGeometry($$anchor, { args: [10, 10] });
						});

						var node_28 = $.sibling(node_27, 2);

						$.component(node_28, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_2) => {
							T_MeshBasicMaterial_2($$anchor, { color: '#FFD0CB' });
						});

						$.append($$anchor, fragment_10);
					},
					$$slots: { default: true }
				});
			});

			var node_29 = $.sibling(node_26, 2);

			$.component(node_29, () => T.Mesh, ($$anchor, T_Mesh_4) => {
				T_Mesh_4($$anchor, {
					position: [4, 10, 5],
					oncreate: (ref) => ref.lookAt(0, 0, 0),
					children: ($$anchor, $$slotProps) => {
						var fragment_11 = root_1();
						var node_30 = $.first_child(fragment_11);

						$.component(node_30, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry_1) => {
							T_PlaneGeometry_1($$anchor, { args: [10, 10] });
						});

						var node_31 = $.sibling(node_30, 2);

						$.component(node_31, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial_3) => {
							T_MeshBasicMaterial_3($$anchor, { color: '#2223FF' });
						});

						$.append($$anchor, fragment_11);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}