import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createSceneContext, observe, T, useTask, useThrelte } from '@threlte/core';
import { useCubeCamera } from '../../../hooks/useCubeCamera.svelte.js';
import { useEnvironment } from '../utils/useEnvironment.svelte.js';

var root = $.from_html(`<!> <!>`, 1);

export default function VirtualEnvironment($$anchor, $$props) {
	$.push($$props, true);

	const ctx = useThrelte();

	let far = $.prop($$props, 'far', 3, 1000),
		frames = $.prop($$props, 'frames', 3, Infinity),
		isBackground = $.prop($$props, 'isBackground', 3, false),
		isEnvironment = $.prop($$props, 'isEnvironment', 3, true),
		near = $.prop($$props, 'near', 3, 0.1),
		resolution = $.prop($$props, 'resolution', 3, 256),
		parentScene = $.prop($$props, 'scene', 19, () => ctx.scene);

	// Create a parent scene to render the virtual environment into
	const { scene } = createSceneContext();

	const { camera, renderTarget } = useCubeCamera(() => near(), () => far(), () => resolution());

	useEnvironment(() => parentScene(), () => renderTarget.texture, () => isBackground(), () => isEnvironment());

	const update = () => {
		camera.update(ctx.renderer, scene);
	};

	let running = $.state(false);
	let count = 0;

	useTask(
		() => {
			// if frames === Infinity, the task will run indefinitely
			if (count < frames()) {
				update();
				count += 1;
			} else {
				$.set(running, false);
				$$props.onupdatestop?.();
			}
		},
		{ running: () => $.get(running) }
	);

	const restart = () => {
		if ($.get(running)) {
			$$props.onupdatestop?.();
		}

		count = 0;
		$.set(running, true);
		$$props.onupdatestart?.();
	};

	// if any of these props update, the task will need to be restarted
	observe(() => [far(), near(), frames(), resolution()], restart);

	var $$exports = { camera, renderTarget, update, restart };

	{
		let $0 = $.derived(() => $$props.visible ? undefined : false);

		T($$anchor, {
			get is() {
				return scene;
			},

			get attach() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				T(node, {
					get is() {
						return camera;
					}
				});

				var node_1 = $.sibling(node, 2);

				$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ camera, renderTarget, restart, update }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}