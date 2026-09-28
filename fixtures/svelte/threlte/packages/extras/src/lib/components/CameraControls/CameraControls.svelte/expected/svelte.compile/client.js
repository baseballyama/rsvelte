import 'svelte/internal/disclose-version';
import { T, useTask, useParent, useThrelte, isInstanceOf } from '@threlte/core';

import {
	Box3,
	Matrix4,
	Quaternion,
	Raycaster,
	Sphere,
	Spherical,
	Vector2,
	Vector3,
	Vector4
} from 'three';

import CameraControls from 'camera-controls';
import { useControlsContext } from '../controls/useControlsContext.js';
import { untrack } from 'svelte';
import * as $ from 'svelte/internal/client';

export { default as CameraControlsRef } from 'camera-controls';

let installed = false;

const install = () => {
	if (installed) {
		return;
	}

	CameraControls.install({
		THREE: {
			Vector2,
			Vector3,
			Vector4,
			Quaternion,
			Matrix4,
			Spherical,
			Box3,
			Sphere,
			Raycaster
		}
	});

	installed = true;
};

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'camera',
	'pointerLock',
	'pointerLockSensitivity',
	'children'
]);

export default function CameraControls_1($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const $defaultCamera = () => $.store_get(defaultCamera, '$defaultCamera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	install();

	let ref = $.prop($$props, 'ref', 15),
		pointerLock = $.prop($$props, 'pointerLock', 3, false),
		pointerLockSensitivity = $.prop($$props, 'pointerLockSensitivity', 3, 0.003),
		rest = $.rest_props($$props, rest_excludes);

	const { dom, camera: defaultCamera, invalidate } = useThrelte();
	const { cameraControls } = useControlsContext();
	const parent = useParent();

	const camera = $.derived(() => {
		if ($$props.camera) {
			return $$props.camera;
		}

		if (isInstanceOf($parent(), 'PerspectiveCamera') || isInstanceOf($parent(), 'OrthographicCamera')) {
			return $parent();
		}

		return $defaultCamera();
	});

	const controls = new CameraControls(untrack(() => $.get(camera)), dom);

	$.user_pre_effect(() => {
		controls.camera = $.get(camera);
	});

	$.user_pre_effect(() => {
		cameraControls.set(controls);

		return () => {
			cameraControls.set(undefined);
		};
	});

	useTask(
		(delta) => {
			if (!controls.enabled) {
				return;
			}

			if (controls.update(delta)) {
				invalidate();
			}
		},
		{ autoInvalidate: false }
	);

	$.user_effect(() => {
		if (!pointerLock()) return;

		const savedButtons = { ...controls.mouseButtons };

		controls.mouseButtons.left = CameraControls.ACTION.NONE;
		controls.mouseButtons.middle = CameraControls.ACTION.NONE;
		controls.mouseButtons.right = CameraControls.ACTION.NONE;

		let locked = false;

		const onLockChange = () => {
			locked = document.pointerLockElement === dom;
		};

		const onPointerMove = (event) => {
			if (!locked || !controls.enabled) return;

			controls.rotate(-event.movementX * pointerLockSensitivity(), -event.movementY * pointerLockSensitivity(), false);
			invalidate();
		};

		const onClick = () => {
			if (!controls.enabled) return;

			if (document.pointerLockElement !== dom) {
				dom.requestPointerLock();
			}
		};

		dom.addEventListener('click', onClick);
		document.addEventListener('pointerlockchange', onLockChange);
		document.addEventListener('pointermove', onPointerMove);

		return () => {
			dom.removeEventListener('click', onClick);
			document.removeEventListener('pointerlockchange', onLockChange);
			document.removeEventListener('pointermove', onPointerMove);

			if (document.pointerLockElement === dom) document.exitPointerLock();

			controls.mouseButtons.left = savedButtons.left;
			controls.mouseButtons.middle = savedButtons.middle;
			controls.mouseButtons.right = savedButtons.right;
		};
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return controls;
			}
		},
		() => rest,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: controls }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
	$$cleanup();
}