import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask, useThrelte } from '@threlte/core';
import { onMount } from 'svelte';
import { Element, Pane } from 'svelte-tweakpane-ui';
import { Vector2, Vector4 } from 'three';
import Portal from '../../components/Portal.svelte';
import { useStudio } from '../../internal/extensions.js';
import { useStudioObjectsRegistry } from '../studio-objects-registry/useStudioObjectsRegistry.svelte.js';
import { editorCameraScope } from './types.js';

var root = $.from_html(`<canvas></canvas>`);

export default function DefaultCamera($$anchor, $$props) {
	$.push($$props, true);

	const { useExtension } = useStudio();
	const { renderer, canvas, scene, autoRenderTask, invalidate } = useThrelte();
	const editorCameraExtension = useExtension(editorCameraScope);
	const studioObjectsRegistry = useStudioObjectsRegistry();
	const defaultCameraObject = $.derived(() => editorCameraExtension.state.defaultCamera.object);
	const width = $.derived(() => editorCameraExtension.state.defaultCamera.width);
	const height = $.derived(() => editorCameraExtension.state.defaultCamera.height);
	let canvasEl = $.state(undefined);
	const context = $.derived(() => $.get(canvasEl) ? $.get(canvasEl).getContext('2d') : undefined);
	let previousAspect = 0;

	const setupPerspectiveCamera = (camera) => {
		previousAspect = camera.aspect;

		// set up perspective cam to be 16/9
		camera.aspect = $.get(width) / $.get(height);

		camera.updateProjectionMatrix();
	};

	let previousLeft = 0;
	let previousRight = 0;

	const updateOrthographicCamera = (camera) => {
		// set up ortho cam to be 16/9
		const frustumHeight = camera.top - camera.bottom;

		const aspect = $.get(width) / $.get(height);

		previousLeft = camera.left;
		previousRight = camera.right;
		camera.left = -frustumHeight * aspect;
		camera.right = frustumHeight * aspect;
		camera.updateProjectionMatrix();
	};

	const updateCamera = (camera) => {
		if (camera.isPerspectiveCamera) {
			setupPerspectiveCamera(camera);
		} else if (camera.isOrthographicCamera) {
			updateOrthographicCamera(camera);
		}
	};

	const resetPerspectiveCamera = (camera) => {
		camera.aspect = previousAspect;
		camera.updateProjectionMatrix();
	};

	const resetOrthographicCamera = (camera) => {
		camera.left = previousLeft;
		camera.right = previousRight;
		camera.updateProjectionMatrix();
	};

	const resetCamera = (camera) => {
		if (camera.isPerspectiveCamera) {
			resetPerspectiveCamera(camera);
		} else if (camera.isOrthographicCamera) {
			resetOrthographicCamera(camera);
		}
	};

	const viewport = new Vector4();
	const size = new Vector2();
	let dpr = 0;
	const studioObjectsArray = $.derived(() => Array.from(studioObjectsRegistry.objects));

	useTask(
		() => {
			if (!$.get(context) || !$.get(canvasEl)) return;

			const defaultCamera = $.get(defaultCameraObject);

			if (!defaultCamera) return;

			updateCamera(defaultCamera);
			renderer.getViewport(viewport);
			renderer.getSize(size);

			const setupCanvas = dpr === 0;

			dpr = renderer.getPixelRatio();

			if (setupCanvas) {
				$.get(canvasEl).width = $.get(width) * dpr;
				$.get(canvasEl).height = $.get(height) * dpr;
			}

			// set viewport
			renderer.setViewport(0, 0, $.get(width), $.get(height));

			for (let index = 0; index < $.get(studioObjectsArray).length; index++) {
				const obj = $.get(studioObjectsArray)[index];

				obj.userData.__threlte_studio_default_camera_visible = obj.visible;
				obj.visible = false;
			}

			const originalOverrideMaterial = scene.overrideMaterial;

			scene.overrideMaterial = null;
			renderer.render(scene, defaultCamera);
			scene.overrideMaterial = originalOverrideMaterial;

			for (let index = 0; index < $.get(studioObjectsArray).length; index++) {
				const obj = $.get(studioObjectsArray)[index];

				obj.visible = obj.userData.__threlte_studio_default_camera_visible;
			}

			// reset viewport
			renderer.setViewport(viewport);

			// draw to canvas
			$.get(context).clearRect(0, 0, $.get(width) * dpr, $.get(height) * dpr);

			$.get(context).drawImage(canvas, 0, (size.y - $.get(height)) * dpr, $.get(width) * dpr, $.get(height) * dpr, 0, 0, $.get(width) * dpr, $.get(height) * dpr);
			resetCamera(defaultCamera);
		},
		{ before: autoRenderTask, autoInvalidate: false }
	);

	onMount(invalidate);

	Portal($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Pane($$anchor, {
				position: 'draggable',
				get width() {
					return $.get(width);
				},
				title: 'Default Camera',
				userExpandable: false,
				expanded: true,
				resizable: false,
				padding: '6px',
				storePositionLocally: false,
				x: 99999,
				y: 99999,
				children: ($$anchor, $$slotProps) => {
					Element($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var canvas_1 = root();

							$.bind_this(canvas_1, ($$value) => $.set(canvasEl, $$value), () => $.get(canvasEl));
							$.template_effect(() => $.set_style(canvas_1, `width: ${$.get(width) ?? ''}px; height: ${$.get(height) ?? ''}px; display: block`));
							$.append($$anchor, canvas_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}