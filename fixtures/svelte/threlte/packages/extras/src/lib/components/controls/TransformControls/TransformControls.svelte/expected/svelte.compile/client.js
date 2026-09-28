import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, observe, useThrelte } from '@threlte/core';
import { Group } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useControlsContext } from '../useControlsContext.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'autoPauseControls',
	'autoPauseOrbitControls',
	'autoPauseTrackballControls',
	'cameraControls',
	'object',
	'controls',
	'group',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function TransformControls_1($$anchor, $$props) {
	$.push($$props, true);

	const $camera = () => $.store_get(camera, '$camera', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let autoPauseControls = $.prop($$props, 'autoPauseControls', 3, true),
		controls = $.prop($$props, 'controls', 15),
		group = $.prop($$props, 'group', 15),
		props = $.rest_props($$props, rest_excludes);

	const { camera, dom, invalidate, scene } = useThrelte();

	const {
		orbitControls,
		trackballControls,
		cameraControls,
		transformControls: transformControlsContext
	} = useControlsContext();

	let isDragging = $.state(false);

	// Resolve effective pause state: deprecated per-control props take
	// precedence if explicitly set, otherwise fall back to autoPauseControls.
	const shouldPauseOrbit = $.derived(() => $$props.autoPauseOrbitControls ?? autoPauseControls());

	const shouldPauseTrackball = $.derived(() => $$props.autoPauseTrackballControls ?? autoPauseControls());
	const shouldPauseCamera = $.derived(autoPauseControls);

	observe(() => [orbitControls, $.get(isDragging), $.get(shouldPauseOrbit)], ([orbitControls, isDragging, shouldPause]) => {
		if (!orbitControls || !orbitControls.enabled && isDragging) return;

		orbitControls.enabled = !(isDragging && shouldPause);

		return () => {
			orbitControls.enabled = true;
		};
	});

	observe(
		() => [
			trackballControls,
			$.get(isDragging),
			$.get(shouldPauseTrackball)
		],
		([trackballControls, isDragging, shouldPause]) => {
			if (!trackballControls || !trackballControls.enabled && isDragging) return;

			trackballControls.enabled = !(isDragging && shouldPause);

			return () => {
				trackballControls.enabled = true;
			};
		}
	);

	observe(() => [cameraControls, $.get(isDragging), $.get(shouldPauseCamera)], ([cameraControls, isDragging, shouldPause]) => {
		if (!cameraControls || !cameraControls.enabled && isDragging) return;

		cameraControls.enabled = !(isDragging && shouldPause);

		return () => {
			cameraControls.enabled = true;
		};
	});

	// Custom/third-party controls passed via the cameraControls prop
	observe(
		() => [
			$$props.cameraControls,
			$.get(isDragging),
			autoPauseControls()
		],
		([controls, isDragging, shouldPause]) => {
			if (!controls || !controls.enabled && isDragging) return;

			controls.enabled = !(isDragging && shouldPause);

			return () => {
				controls.enabled = true;
			};
		}
	);

	// `<HTML> sets canvas pointer-events to "none" if occluding, so events must be placed on the canvas parent.
	const transformControls = new TransformControls(camera.current, dom);

	const attachGroup = new Group();

	$.user_pre_effect(() => {
		transformControls.camera = $camera();
	});

	$.user_pre_effect(() => {
		transformControls?.attach($$props.object ?? attachGroup);

		return () => transformControls?.detach();
	});

	$.user_pre_effect(() => {
		transformControlsContext.set(transformControls);

		return () => {
			transformControlsContext.set(undefined);
		};
	});

	// This component is receiving the props for the controls as well as the props
	// for the group, so we need to split them up
	const transformOnlyPropNames = [
		'enabled',
		'axis',
		'mode',
		'translationSnap',
		'rotationSnap',
		'scaleSnap',
		'space',
		'size',
		'showX',
		'showY',
		'showZ',
		'visible',
		'onmouseDown',
		'onmouseUp',
		'onobjectChange'
	];

	let transformProps = $.state($.proxy({}));
	let objectProps = $.state($.proxy({}));

	$.user_pre_effect(() => {
		$.set(transformProps, {}, true);
		$.set(objectProps, {}, true);

		Object.keys(props).forEach((key) => {
			$.user_pre_effect(() => {
				if (transformOnlyPropNames.includes(key)) {
					$.get(transformProps)[key] = props[key];
				} else {
					$.get(objectProps)[key] = props[key];
				}
			});
		});
	});

	const onchange = (event) => {
		invalidate();

		if (transformControls.dragging && !$.get(isDragging)) {
			$.set(isDragging, true);
		} else if (!transformControls.dragging && $.get(isDragging)) {
			$.set(isDragging, false);
		}

		// TODO: unfortunately the type of the event prop is not correct *yet*
		$$props.onchange?.(event);
	};

	var fragment = root();
	var node = $.first_child(fragment);

	T(node, $.spread_props(
		{
			get is() {
				return transformControls;
			},
			onchange
		},
		() => $.get(transformProps),
		{
			attach: ({ ref }) => {
				const helper = ref.getHelper();

				scene.add(helper);

				return () => {
					scene.remove(helper);
				};
			},
			dispose: false,
			oncreate: (ref) => {
				return () => ref.dispose();
			},

			get ref() {
				return controls();
			},

			set ref($$value) {
				controls($$value);
			}
		}
	));

	var node_1 = $.sibling(node, 2);

	T(node_1, $.spread_props(
		{
			get is() {
				return attachGroup;
			}
		},
		() => $.get(objectProps),
		{
			get ref() {
				return group();
			},

			set ref($$value) {
				group($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ ref: attachGroup }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}