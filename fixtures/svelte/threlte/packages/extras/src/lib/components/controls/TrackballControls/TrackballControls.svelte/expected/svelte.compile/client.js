import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core';
import { TrackballControls as ThreeTrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import { useControlsContext } from '../useControlsContext.js';
import { untrack } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'onchange',
	'camera',
	'ref',
	'children'
]);

export default function TrackballControls($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const $defaultCamera = () => $.store_get(defaultCamera, '$defaultCamera', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { dom, camera: defaultCamera, invalidate, size } = useThrelte();
	const parent = useParent();

	const resolvedCamera = $.derived(() => $$props.camera
		? $$props.camera
		: isInstanceOf($parent(), 'Camera') ? $parent() : $defaultCamera());

	// `<HTML> sets canvas pointer-events to "none" if occluding, so events must be placed on the canvas parent.
	const controls = new ThreeTrackballControls(untrack(() => $.get(resolvedCamera)));

	$.user_pre_effect(() => {
		controls.object = $.get(resolvedCamera);
	});

	useTask(
		() => {
			controls.update();
		},
		{ autoInvalidate: false }
	);

	$.user_effect(() => {
		controls.connect(dom);

		return () => controls.disconnect();
	});

	$.user_effect(() => {
		const { width, height } = $size();

		if (width && height) {
			controls.handleResize();
		}
	});

	const { trackballControls } = useControlsContext();

	$.user_pre_effect(() => {
		const handleChange = (event) => {
			invalidate();
			$$props.onchange?.(event);
		};

		const currentControls = controls;

		trackballControls.set(controls);
		currentControls.addEventListener('change', handleChange);

		return () => {
			trackballControls.set(undefined);
			currentControls.removeEventListener('change', handleChange);
		};
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return controls;
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