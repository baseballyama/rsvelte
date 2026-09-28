import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { XR, Controller, Hand, Headset, useTeleport, useXR } from '$lib/index.js';
import Gamepad from './Gamepad.svelte';
import Teleport from './Teleport.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $isPresenting = () => $.store_get(isPresenting, '$isPresenting', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { isPresenting } = useXR();
	const teleport = useTeleport();

	$.user_effect(() => {
		if ($isPresenting()) teleport([0, 0, 5]);
	});

	let listenToGamepad = $.state(false);
	var fragment = root_2();

	$.event('keydown', $.window, (e) => {
		if (e.key === 'g') {
			$.set(listenToGamepad, !$.get(listenToGamepad));
		}
	});

	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Gamepad($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($.get(listenToGamepad)) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	Headset(node_1, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
				T_Mesh($$anchor, {
					'position.z': -0.5,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root();
						var node_3 = $.first_child(fragment_3);

						$.component(node_3, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
							T_CylinderGeometry($$anchor, { args: [0.01, 0.01, 0.08] });
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
							T_MeshStandardMaterial($$anchor, { color: 'orange' });
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

	var node_5 = $.sibling(node_1, 2);

	XR(node_5, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_6 = $.first_child(fragment_4);

			{
				const targetRay = ($$anchor) => {
					var fragment_5 = $.comment();
					var node_7 = $.first_child(fragment_5);

					$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh_1) => {
						T_Mesh_1($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root();
								var node_8 = $.first_child(fragment_6);

								$.component(node_8, () => T.BoxGeometry, ($$anchor, T_BoxGeometry) => {
									T_BoxGeometry($$anchor, { args: [0.05, 0.05, 0.05] });
								});

								var node_9 = $.sibling(node_8, 2);

								$.component(node_9, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
									T_MeshStandardMaterial_1($$anchor, { color: 'turquoise' });
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				};

				const grip = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_10 = $.first_child(fragment_7);

					$.component(node_10, () => T.Mesh, ($$anchor, T_Mesh_2) => {
						T_Mesh_2($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_8 = root();
								var node_11 = $.first_child(fragment_8);

								$.component(node_11, () => T.IcosahedronGeometry, ($$anchor, T_IcosahedronGeometry) => {
									T_IcosahedronGeometry($$anchor, { args: [0.02] });
								});

								var node_12 = $.sibling(node_11, 2);

								$.component(node_12, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
									T_MeshStandardMaterial_2($$anchor, { color: 'skyblue' });
								});

								$.append($$anchor, fragment_8);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_7);
				};

				Controller(node_6, {
					left: true,
					onconnected: () => console.log('connect'),
					onselect: () => console.log('select'),
					targetRay,
					grip,
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = $.comment();
						var node_13 = $.first_child(fragment_9);

						$.component(node_13, () => T.Mesh, ($$anchor, T_Mesh_3) => {
							T_Mesh_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root();
									var node_14 = $.first_child(fragment_10);

									$.component(node_14, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_1) => {
										T_CylinderGeometry_1($$anchor, { args: [0.01, 0.01, 0.08] });
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_3) => {
										T_MeshStandardMaterial_3($$anchor, { color: 'orange' });
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { targetRay: true, grip: true, default: true }
				});
			}

			var node_16 = $.sibling(node_6, 2);

			Controller(node_16, {
				right: true,
				onconnected: () => console.log('connect'),
				onselect: () => console.log('select')
			});

			var node_17 = $.sibling(node_16, 2);

			{
				const wrist = ($$anchor) => {
					var fragment_11 = $.comment();
					var node_18 = $.first_child(fragment_11);

					$.component(node_18, () => T.Mesh, ($$anchor, T_Mesh_4) => {
						T_Mesh_4($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_12 = root();
								var node_19 = $.first_child(fragment_12);

								$.component(node_19, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_1) => {
									T_BoxGeometry_1($$anchor, { args: [0.05, 0.05, 0.05] });
								});

								var node_20 = $.sibling(node_19, 2);

								$.component(node_20, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_4) => {
									T_MeshStandardMaterial_4($$anchor, { color: 'turquoise' });
								});

								$.append($$anchor, fragment_12);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_11);
				};

				Hand(node_17, { left: true, wrist, $$slots: { wrist: true } });
			}

			var node_21 = $.sibling(node_17, 2);

			Hand(node_21, {
				right: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = $.comment();
					var node_22 = $.first_child(fragment_13);

					$.component(node_22, () => T.Mesh, ($$anchor, T_Mesh_5) => {
						T_Mesh_5($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_14 = root();
								var node_23 = $.first_child(fragment_14);

								$.component(node_23, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_2) => {
									T_BoxGeometry_2($$anchor, { args: [0.05, 0.05, 0.05] });
								});

								var node_24 = $.sibling(node_23, 2);

								$.component(node_24, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_5) => {
									T_MeshStandardMaterial_5($$anchor, { color: 'skyblue' });
								});

								$.append($$anchor, fragment_14);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_25 = $.sibling(node_5, 2);

	Teleport(node_25, {});

	var node_26 = $.sibling(node_25, 2);

	$.component(node_26, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [3, 3, 3],
			oncreate: (ref) => ref.lookAt(0, 0, 0)
		});
	});

	var node_27 = $.sibling(node_26, 2);

	$.component(node_27, () => T.Mesh, ($$anchor, T_Mesh_6) => {
		T_Mesh_6($$anchor, {
			'position.y': 0.5,
			castShadow: true,
			receiveShadow: true,
			children: ($$anchor, $$slotProps) => {
				var fragment_15 = root();
				var node_28 = $.first_child(fragment_15);

				$.component(node_28, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_6) => {
					T_MeshStandardMaterial_6($$anchor, { color: 'hotpink' });
				});

				var node_29 = $.sibling(node_28, 2);

				$.component(node_29, () => T.BoxGeometry, ($$anchor, T_BoxGeometry_3) => {
					T_BoxGeometry_3($$anchor, {});
				});

				$.append($$anchor, fragment_15);
			},
			$$slots: { default: true }
		});
	});

	var node_30 = $.sibling(node_27, 2);

	$.component(node_30, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { castShadow: true });
	});

	var node_31 = $.sibling(node_30, 2);

	$.component(node_31, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}