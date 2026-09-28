import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Group } from 'three';
import { T, useThrelte } from '@threlte/core';
import { useXROrigin } from '../hooks/useXROrigin.svelte.js';
import { isPresenting } from '../internal/state.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);

export default function XROrigin($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const { camera, scene } = useThrelte();
	const group = new Group();
	const origin = useXROrigin();

	$.user_pre_effect(() => {
		if (origin.current !== undefined && origin.current !== group) {
			console.warn('Only one <XROrigin> may be mounted within a single <XR>. The newer instance will take over.');
		}

		origin.current = group;

		return () => {
			if (origin.current === group) {
				origin.current = undefined;
			}
		};
	});

	// Parent the active scene camera to this group so its `parent.matrixWorld`
	// reflects our transform. Three's `WebXRManager` reads `camera.parent` (where
	// `camera` is the camera passed to `renderer.render(scene, camera)`) — NOT
	// `renderer.xr.getCamera().parent` — when composing the XR view matrices, so
	// reparenting the XR camera itself has no effect. When this component
	// unmounts (or the active camera changes) the camera returns to its previous
	// parent so non-XR rendering keeps working.
	$.user_pre_effect(() => {
		if (!isPresenting.current) return;

		const userCamera = $camera();
		const previousParent = userCamera.parent ?? scene;

		group.add(userCamera);

		return () => {
			previousParent.add(userCamera);
		};
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return group;
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

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: group }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
	$$cleanup();
}