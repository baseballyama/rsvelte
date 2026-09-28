import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { OrbitControls, Text, interactivity } from '@threlte/extras';

import {
	Controller,
	Hand,
	XR,
	XROrigin,
	pointerControls,
	useHeadset,
	useTeleport
} from '@threlte/xr';

import { Group } from 'three';
import Pad from './Pad.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const pads = [
		{
			id: 'rose',
			label: 'Rose',
			color: '#fb7185',
			position: [-1.8, 0, -2.1]
		},

		{
			id: 'cyan',
			label: 'Cyan',
			color: '#22d3ee',
			position: [0, 0, -3.2]
		},

		{
			id: 'amber',
			label: 'Amber',
			color: '#f59e0b',
			position: [1.9, 0, -1.75]
		}
	];

	const teleport = useTeleport();
	const headset = useHeadset();
	const feetMarker = new Group();
	let activePadId = $.state('cyan');

	interactivity();
	pointerControls('left');
	pointerControls('right');

	useTask(() => {
		feetMarker.position.set(headset.position.x, 0.02, headset.position.z);
	});

	const goTo = (pad) => {
		$.set(activePadId, pad.id, true);
		teleport(pad.position);
	};

	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		const fallback = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
				T_PerspectiveCamera($$anchor, {
					makeDefault: true,
					position: [0.2, 2.1, 3.8],
					oncreate: (ref) => {
						ref.lookAt(0, 0.75, -1.6);
					},

					children: ($$anchor, $$slotProps) => {
						OrbitControls($$anchor, { target: [0, 0.7, -1.6], enablePan: false });
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		XR(node, {
			fallback,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				$.component(node_2, () => T.Group, ($$anchor, T_Group) => {
					T_Group($$anchor, {
						position: [0.75, 0, 0.55],
						'rotation.y': Math.PI / 5,
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_2();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh) => {
								T_Mesh($$anchor, {
									'position.y': 0.01,
									'rotation.x': -Math.PI / 2,
									raycast: () => false,
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root();
										var node_4 = $.first_child(fragment_5);

										$.component(node_4, () => T.RingGeometry, ($$anchor, T_RingGeometry) => {
											T_RingGeometry($$anchor, { args: [0.22, 0.27, 48] });
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
											T_MeshStandardMaterial($$anchor, {
												color: '#fde68a',
												emissive: '#f59e0b',
												emissiveIntensity: 0.25,
												side: 2
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_3, 2);

							Text(node_6, {
								color: '#fde68a',
								fontSize: 0.085,
								anchorX: 'center',
								anchorY: 'bottom',
								position: [0, 0.16, 0],
								raycast: () => false,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('rotated rig parent');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							XROrigin(node_7, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_8 = $.first_child(fragment_6);

									Controller(node_8, { left: true });

									var node_9 = $.sibling(node_8, 2);

									Controller(node_9, { right: true });

									var node_10 = $.sibling(node_9, 2);

									Hand(node_10, { left: true });

									var node_11 = $.sibling(node_10, 2);

									Hand(node_11, { right: true });
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { fallback: true, default: true }
		});
	}

	var node_12 = $.sibling(node, 2);

	T(node_12, {
		get is() {
			return feetMarker;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_13 = $.first_child(fragment_7);

			$.component(node_13, () => T.Mesh, ($$anchor, T_Mesh_1) => {
				T_Mesh_1($$anchor, {
					'rotation.x': -Math.PI / 2,
					raycast: () => false,
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root();
						var node_14 = $.first_child(fragment_8);

						$.component(node_14, () => T.RingGeometry, ($$anchor, T_RingGeometry_1) => {
							T_RingGeometry_1($$anchor, { args: [0.09, 0.14, 48] });
						});

						var node_15 = $.sibling(node_14, 2);

						$.component(node_15, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_1) => {
							T_MeshStandardMaterial_1($$anchor, {
								color: '#ecfeff',
								emissive: '#22d3ee',
								emissiveIntensity: 0.9,
								side: 2
							});
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});
			});

			var node_16 = $.sibling(node_13, 2);

			Text(node_16, {
				color: '#cffafe',
				fontSize: 0.095,
				anchorX: 'center',
				anchorY: 'bottom',
				position: [0, 0.13, 0],
				raycast: () => false,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('feet');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_12, 2);

	$.component(node_17, () => T.Mesh, ($$anchor, T_Mesh_2) => {
		T_Mesh_2($$anchor, {
			receiveShadow: true,
			'rotation.x': -Math.PI / 2,
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root();
				var node_18 = $.first_child(fragment_9);

				$.component(node_18, () => T.CircleGeometry, ($$anchor, T_CircleGeometry) => {
					T_CircleGeometry($$anchor, { args: [8, 96] });
				});

				var node_19 = $.sibling(node_18, 2);

				$.component(node_19, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial_2) => {
					T_MeshStandardMaterial_2($$anchor, { color: '#0f172a' });
				});

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	var node_20 = $.sibling(node_17, 2);

	$.component(node_20, () => T.GridHelper, ($$anchor, T_GridHelper) => {
		T_GridHelper($$anchor, { args: [16, 16, '#1f2937', '#111827'], 'position.y': 0.001 });
	});

	var node_21 = $.sibling(node_20, 2);

	$.each(node_21, 17, () => pads, $.index, ($$anchor, pad) => {
		{
			let $0 = $.derived(() => $.get(activePadId) === $.get(pad).id);

			Pad($$anchor, {
				get active() {
					return $.get($0);
				},

				get color() {
					return $.get(pad).color;
				},

				get label() {
					return $.get(pad).label;
				},

				get position() {
					return $.get(pad).position;
				},
				onclick: () => goTo($.get(pad))
			});
		}
	});

	var node_22 = $.sibling(node_21, 2);

	$.component(node_22, () => T.Group, ($$anchor, T_Group_1) => {
		T_Group_1($$anchor, {
			position: [0, 1.45, 1.2],
			children: ($$anchor, $$slotProps) => {
				Text($$anchor, {
					color: '#e5e7eb',
					fontSize: 0.11,
					maxWidth: 3.3,
					anchorX: 'center',
					anchorY: 'middle',
					textAlign: 'center',
					raycast: () => false,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Walk around in room-scale, then click a pad. The cyan feet marker should land exactly on the\n    selected target even though the XR origin lives inside a rotated parent rig.');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	var node_23 = $.sibling(node_22, 2);

	$.component(node_23, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.65 });
	});

	var node_24 = $.sibling(node_23, 2);

	$.component(node_24, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			castShadow: true,
			intensity: 1.8,
			position: [3, 5, 2],
			'shadow.mapSize.width': 1024,
			'shadow.mapSize.height': 1024,
			'shadow.camera.top': 6,
			'shadow.camera.right': 6,
			'shadow.camera.bottom': -6,
			'shadow.camera.left': -6
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}