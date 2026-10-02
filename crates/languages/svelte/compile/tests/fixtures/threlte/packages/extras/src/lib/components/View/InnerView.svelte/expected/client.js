import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	createCacheContext,
	createCameraContext,
	createDOMContext,
	createParentContext,
	createParentObject3DContext,
	createSceneContext,
	createUserContext,
	useTask,
	useThrelte
} from '@threlte/core';

import { Scene, Vector4 } from 'three';

export default function InnerView($$anchor, $$props) {
	$.push($$props, true);

	let isOffscreen = $.state(false);

	const observer = new IntersectionObserver(([entry]) => {
		$.set(isOffscreen, !entry.isIntersecting);
	});

	$.user_effect(() => {
		observer.observe($$props.dom);

		return () => {
			observer.disconnect();
		};
	});

	const parentContext = useThrelte();

	createDOMContext(() => ({ dom: $$props.dom, canvas: parentContext.canvas }));
	createCacheContext();

	const { scene } = createSceneContext($$props.scene);

	createParentContext(scene);
	createParentObject3DContext(scene);

	const { camera } = createCameraContext();

	createUserContext();

	const { renderer, renderStage, canvas } = useThrelte();
	const originalViewport = new Vector4();
	const originalScissor = new Vector4();
	let originalScissorTest;

	useTask(
		Symbol('<View>'),
		() => {
			if ($.get(isOffscreen)) return;

			const { left: trackLeft, bottom: trackBottom, width, height } = $$props.dom.getBoundingClientRect();
			const { bottom: canvasBottom, left: canvasLeft } = canvas.getBoundingClientRect();
			const bottom = canvasBottom - trackBottom;
			const left = trackLeft - canvasLeft;

			// save original state
			renderer.getScissor(originalScissor);

			renderer.getViewport(originalViewport);
			originalScissorTest = renderer.getScissorTest();

			// apply scissor
			renderer.setViewport(left, bottom, width, height);

			renderer.setScissor(left, bottom, width, height);
			renderer.setScissorTest(true);

			// render
			renderer.render(scene, camera.current);

			// reset state
			renderer.setViewport(originalViewport);

			renderer.setScissor(originalScissor);
			renderer.setScissorTest(originalScissorTest);
		},
		{ stage: renderStage, running: () => !$.get(isOffscreen) }
	);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}