import 'svelte/internal/disclose-version';
import CameraControls from 'camera-controls';

import {
	Box3,
	MathUtils,
	Matrix4,
	Quaternion,
	Raycaster,
	Sphere,
	Spherical,
	Vector2,
	Vector3,
	Vector4
} from 'three';

import * as $ from 'svelte/internal/client';
import { useTask, useThrelte } from '@threlte/core';
import { onMount, tick } from 'svelte';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useTransformControls } from '../transform-controls/useTransformControls.js';
import { Gizmo } from '@threlte/extras';

let installed = false;

export default function CameraControls_1($$anchor, $$props) {
	$.push($$props, true);

	if (!installed) {
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
				Raycaster,
				MathUtils
			}
		});

		installed = true;
	}

	const { dom, invalidate } = useThrelte();
	const cameraControls = new CameraControls($$props.camera, dom);

	cameraControls.smoothTime = 0.05;
	cameraControls.draggingSmoothTime = 0.05;
	cameraControls.dollyToCursor = true;

	onMount(async () => {
		await tick();
		$$props.cc(cameraControls);
		cameraControls.setPosition(...$$props.initialPosition.toArray(), false);
		cameraControls.setTarget(...$$props.initialTarget.toArray(), false);
	});

	useTask(
		(delta) => {
			cameraControls.update(delta);
		},
		{ autoInvalidate: false }
	);

	const onRest = () => {
		const position = new Vector3();
		const target = new Vector3();

		cameraControls.getPosition(position);
		cameraControls.getTarget(target);
		$$props.rest({ position, target });
	};

	onMount(() => {
		cameraControls.addEventListener('update', invalidate);
		cameraControls.addEventListener('rest', onRest);

		return () => {
			cameraControls.removeEventListener('update', invalidate);
			cameraControls.removeEventListener('rest', onRest);
			cameraControls.dispose();
		};
	});

	const objectSelection = useObjectSelection();
	const transformControls = useTransformControls();
	const anyInUse = $.derived(() => transformControls.inUse || objectSelection.inUse);

	// disable camera controls when transform controls are in use
	$.user_effect(() => {
		cameraControls.enabled = !$.get(anyInUse);
	});

	Gizmo($$anchor, {
		get controls() {
			return cameraControls;
		}
	});

	$.pop();
}