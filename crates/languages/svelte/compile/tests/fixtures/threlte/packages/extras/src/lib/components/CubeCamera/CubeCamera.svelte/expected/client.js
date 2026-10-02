import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from 'three';
import { observe, T, useTask, useThrelte } from '@threlte/core';
import { useCubeCamera } from '../../hooks/useCubeCamera.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'background',
	'far',
	'fog',
	'frames',
	'near',
	'onupdatestart',
	'onupdatestop',
	'resolution',
	'children',
	'ref'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function CubeCamera($$anchor, $$props) {
	$.push($$props, true);

	let background = $.prop($$props, 'background', 3, 'auto'),
		fog = $.prop($$props, 'fog', 3, 'auto'),
		frames = $.prop($$props, 'frames', 3, Infinity),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { camera, renderTarget } = useCubeCamera(() => $$props.near, () => $$props.far, () => $$props.resolution);
	const { renderer, scene } = useThrelte();
	const group = new Group();
	const inner = new Group();
	let count = 0;
	let running = $.state(false);

	const update = () => {
		// if frames === Infinity, the task will run indefinitely
		if (count < frames()) {
			const lastBackground = scene.background;

			if (background() !== 'auto') scene.background = background();

			const lastFog = scene.fog;

			if (fog() !== 'auto') scene.fog = fog();

			inner.visible = false;
			camera.update(renderer, scene);
			scene.background = lastBackground;
			scene.fog = lastFog;
			inner.visible = true;
			count += 1;
		} else {
			$.set(running, false);
			$$props.onupdatestop?.();
		}
	};

	useTask(update, { running: () => $.get(running) });

	const restart = () => {
		if ($.get(running)) {
			$$props.onupdatestop?.();
		}

		count = 0;
		$.set(running, true);
		$$props.onupdatestart?.();
	};

	// if any of these props update, the task will need to be restarted
	observe(
		() => [
			background(),
			$$props.far,
			$$props.near,
			fog(),
			frames(),
			$$props.resolution
		],
		restart
	);

	var $$exports = { camera, renderTarget, update, restart };

	T($$anchor, $.spread_props(
		{
			get is() {
				return group;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
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

				T(node_1, {
					get is() {
						return inner;
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ camera, renderTarget, ref: group, restart, update }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	return $.pop($$exports);
}