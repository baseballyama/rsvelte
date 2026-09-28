import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { VirtualEnvironment } from '@threlte/extras';
import { XR, Controller, Hand, pointerControls } from '@threlte/xr';
import { Vector3 } from 'three';
import Spaceship from './models/spaceship.svelte';
import Stars from './Stars.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	pointerControls('left');
	pointerControls('right');

	const scale = 0.02;

	// Toy hovering at eye level, ~30 cm ahead of the user.
	const home = new Vector3(0, 1.4, -0.3);

	let intersectionPoint;
	let translAccelleration = 0;
	let angleAccelleration = 0;
	let spaceShipRef = $.state(void 0);
	let translY = $.state(0);
	let angleZ = $.state(0);
	const up = new Vector3(0, 1, 0);
	const dir = new Vector3();
	const pivot = new Vector3();

	useTask(() => {
		if (intersectionPoint === undefined) return;

		const targetY = intersectionPoint.y - home.y;

		translAccelleration += (targetY - $.get(translY)) * 0.01;
		translAccelleration *= 0.92;
		$.set(translY, $.get(translY) + translAccelleration);
		pivot.set(home.x, home.y + $.get(translY), home.z);
		dir.copy(intersectionPoint).sub(pivot).normalize();

		const dirCos = dir.dot(up);
		const angle = Math.acos(dirCos) - Math.PI * 0.5;

		angleAccelleration += (angle - $.get(angleZ)) * 0.02;
		angleAccelleration *= 0.9;
		$.set(angleZ, $.get(angleZ) + angleAccelleration);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	XR(node, {});

	var node_1 = $.sibling(node, 2);

	Controller(node_1, { left: true });

	var node_2 = $.sibling(node_1, 2);

	Controller(node_2, { right: true });

	var node_3 = $.sibling(node_2, 2);

	Hand(node_3, { left: true });

	var node_4 = $.sibling(node_3, 2);

	Hand(node_4, { right: true });

	var node_5 = $.sibling(node_4, 2);

	$.component(node_5, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [0, 1.5, 0.3],
			fov: 50,
			oncreate: (ref) => {
				ref.lookAt(home);
			}
		});
	});

	var node_6 = $.sibling(node_5, 2);

	$.component(node_6, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, {
			intensity: 1.8,
			position: [0, 2, 0.5],
			castShadow: true,
			'shadow.bias': -0.0001
		});
	});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get 'position.x'() {
				return home.x;
			},

			get 'position.y'() {
				return home.y;
			},

			get 'position.z'() {
				return home.z;
			},
			visible: false,
			onpointermove: (event) => {
				intersectionPoint = event.point;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_8 = $.first_child(fragment_1);

				$.component(node_8, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, { args: [2, 2] });
				});

				var node_9 = $.sibling(node_8, 2);

				$.component(node_9, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	var node_10 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => [home.x, home.y + $.get(translY), home.z]);
		let $1 = $.derived(() => [$.get(angleZ), 0, $.get(angleZ), 'ZXY']);

		Spaceship(node_10, {
			scale,
			get position() {
				return $.get($0);
			},

			get rotation() {
				return $.get($1);
			},

			get ref() {
				return $.get(spaceShipRef);
			},

			set ref($$value) {
				$.set(spaceShipRef, $$value, true);
			}
		});
	}

	var node_11 = $.sibling(node_10, 2);

	VirtualEnvironment(node_11, {
		visible: true,
		children: ($$anchor, $$slotProps) => {
			Stars($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}