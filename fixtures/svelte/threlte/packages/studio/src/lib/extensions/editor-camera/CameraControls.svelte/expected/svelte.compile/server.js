import * as $ from 'svelte/internal/server';
import { useTask, useThrelte } from '@threlte/core';
import { onMount, tick } from 'svelte';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import { useTransformControls } from '../transform-controls/useTransformControls.js';
import { Gizmo } from '@threlte/extras';
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

let installed = false;

export default function CameraControls_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		const { camera, initialPosition, initialTarget, cc, rest } = $$props;
		const { dom, invalidate } = useThrelte();
		const cameraControls = new CameraControls(camera, dom);

		cameraControls.smoothTime = 0.05;
		cameraControls.draggingSmoothTime = 0.05;
		cameraControls.dollyToCursor = true;

		onMount(async () => {
			await tick();
			cc(cameraControls);
			cameraControls.setPosition(...initialPosition.toArray(), false);
			cameraControls.setTarget(...initialTarget.toArray(), false);
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
			rest({ position, target });
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

		Gizmo($$renderer, {
			controls: // disable camera controls when transform controls are in use
			cameraControls
		});
	});
}