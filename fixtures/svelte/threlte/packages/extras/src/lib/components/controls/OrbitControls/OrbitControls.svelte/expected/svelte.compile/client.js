import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useControlsContext } from '../useControlsContext.js';
import { untrack } from 'svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'camera',
	'ref',
	'children'
]);

export default function OrbitControls_1($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const $defaultCamera = () => $.store_get(defaultCamera, '$defaultCamera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { dom, camera: defaultCamera, invalidate } = useThrelte();
	const parent = useParent();

	const resolvedCamera = $.derived(() => $$props.camera
		? $$props.camera
		: isInstanceOf($parent(), 'Camera') ? $parent() : $defaultCamera());

	// <HTML> sets canvas pointer-events to "none" if occluding, so events must be placed on the canvas parent.
	const controls = new OrbitControls(untrack(() => $.get(resolvedCamera)), dom);

	$.user_pre_effect(() => {
		controls.object = $.get(resolvedCamera);
	});

	const { orbitControls } = useControlsContext();

	useTask(
		() => {
			controls.update();
		},
		{
			autoInvalidate: false,
			running: () => $$props.autoRotate || $$props.enableDamping || false
		}
	);

	const handleChange = (event) => {
		invalidate();
		$$props.onchange?.(event);
	};

	$.user_pre_effect(() => {
		orbitControls.set(controls);

		return () => {
			orbitControls.set(undefined);
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
			onchange: handleChange,
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