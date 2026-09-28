import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Vector3, Quaternion, Group } from 'three';
import { T, useTask } from '@threlte/core';
import { FakeGlowMaterial, Outlines } from '@threlte/extras';
import { Collider, RigidBody } from '@threlte/rapier';
import { Controller, Hand, useController, useXR } from '@threlte/xr';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Sabers($$anchor, $$props) {
	$.push($$props, true);

	const saber = ($$anchor) => {
		var fragment = root_1();
		var node = $.first_child(fragment);

		$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					$.component(node_1, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry) => {
						T_CylinderGeometry($$anchor, { args: [saberRadius, saberRadius, saberLength] });
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
						T_MeshBasicMaterial($$anchor, { color: 'red' });
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});

		var node_3 = $.sibling(node, 2);

		$.component(node_3, () => T.Mesh, ($$anchor, T_Mesh_1) => {
			T_Mesh_1($$anchor, {
				position: [0, saberLength / 2 + 0.05, 0],
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					$.component(node_4, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_1) => {
						T_CylinderGeometry_1($$anchor, { args: [saberRadius, saberRadius, 0.1] });
					});

					var node_5 = $.sibling(node_4, 2);

					$.component(node_5, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
						T_MeshStandardMaterial($$anchor, { color: 'gray', roughness: 0, metalness: 0.5 });
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});

		var node_6 = $.sibling(node_3, 2);

		$.component(node_6, () => T.Mesh, ($$anchor, T_Mesh_2) => {
			T_Mesh_2($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_7 = $.first_child(fragment_3);

					$.component(node_7, () => T.CylinderGeometry, ($$anchor, T_CylinderGeometry_2) => {
						T_CylinderGeometry_2($$anchor, { args: [saberRadius, saberRadius, saberLength] });
					});

					var node_8 = $.sibling(node_7, 2);

					FakeGlowMaterial(node_8, { glowColor: 'red' });

					var node_9 = $.sibling(node_8, 2);

					Outlines(node_9, { color: 'hotpink', thickness: 0.005 });
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment);
	};

	const { isHandTracking } = useXR();
	const leftController = useController('left');
	const rightController = useController('right');

	const pulse = (hand) => {
		const controller = hand === 'left' ? leftController.current : rightController.current;

		controller?.inputSource.gamepad?.hapticActuators[0]?.pulse(0.8, 80);
	};

	let rigidBodyLeft = $.state(void 0);
	let rigidBodyRight = $.state(void 0);
	const leftSaber = new Group();
	const rightSaber = new Group();
	const leftHandSaber = new Group();
	const rightHandSaber = new Group();
	const left = $.derived(() => isHandTracking.current ? leftHandSaber : leftSaber);
	const right = $.derived(() => isHandTracking.current ? rightHandSaber : rightSaber);
	const vec3 = new Vector3();
	const quaternion = new Quaternion();

	useTask(() => {
		$.get(rigidBodyLeft)?.setTranslation($.get(left).getWorldPosition(vec3), true);
		$.get(rigidBodyLeft)?.setRotation($.get(left).getWorldQuaternion(quaternion), true);
		$.get(rigidBodyRight)?.setTranslation($.get(right).getWorldPosition(vec3), true);
		$.get(rigidBodyRight)?.setRotation($.get(right).getWorldQuaternion(quaternion), true);
	});

	const saberRadius = 0.02;
	const saberLength = 1.4;
	var fragment_4 = root_2();
	var node_10 = $.first_child(fragment_4);

	Controller(node_10, {
		left: true,
		children: ($$anchor, $$slotProps) => {
			T($$anchor, {
				get is() {
					return leftSaber;
				},
				'rotation.x': Math.PI / 2,
				'position.z': -saberLength / 2,
				children: ($$anchor, $$slotProps) => {
					saber($$anchor);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	Controller(node_11, {
		right: true,
		children: ($$anchor, $$slotProps) => {
			T($$anchor, {
				get is() {
					return rightSaber;
				},
				'rotation.x': Math.PI / 2,
				'position.z': -saberLength / 2,
				children: ($$anchor, $$slotProps) => {
					saber($$anchor);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 2);

	{
		const wrist = ($$anchor) => {
			T($$anchor, {
				get is() {
					return leftHandSaber;
				},
				'rotation.x': Math.PI / 2,
				'position.z': -saberLength / 2,
				children: ($$anchor, $$slotProps) => {
					saber($$anchor);
				},
				$$slots: { default: true }
			});
		};

		Hand(node_12, { left: true, wrist, $$slots: { wrist: true } });
	}

	var node_13 = $.sibling(node_12, 2);

	{
		const wrist = ($$anchor) => {
			T($$anchor, {
				get is() {
					return rightHandSaber;
				},
				'rotation.x': Math.PI / 2,
				'position.z': -saberLength / 2,
				children: ($$anchor, $$slotProps) => {
					saber($$anchor);
				},
				$$slots: { default: true }
			});
		};

		Hand(node_13, { right: true, wrist, $$slots: { wrist: true } });
	}

	var node_14 = $.sibling(node_13, 2);

	RigidBody(node_14, {
		type: 'kinematicPosition',
		oncollisionenter: () => pulse('left'),
		get rigidBody() {
			return $.get(rigidBodyLeft);
		},

		set rigidBody($$value) {
			$.set(rigidBodyLeft, $$value);
		},

		children: ($$anchor, $$slotProps) => {
			Collider($$anchor, { shape: 'capsule', args: [saberLength / 2, saberRadius] });
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 2);

	RigidBody(node_15, {
		type: 'kinematicPosition',
		oncollisionenter: () => pulse('right'),
		get rigidBody() {
			return $.get(rigidBodyRight);
		},

		set rigidBody($$value) {
			$.set(rigidBodyRight, $$value);
		},

		children: ($$anchor, $$slotProps) => {
			Collider($$anchor, { shape: 'capsule', args: [saberLength / 2, saberRadius] });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment_4);
	$.pop();
}