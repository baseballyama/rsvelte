import * as $ from 'svelte/internal/server';
import { T, observe, useThrelte } from '@threlte/core';
import { Group } from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useControlsContext } from '../useControlsContext.js';

export default function TransformControls_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			autoPauseControls = true,
			autoPauseOrbitControls,
			autoPauseTrackballControls,
			cameraControls: customCameraControls,
			object,
			controls = void 0,
			group = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { camera, dom, invalidate, scene } = useThrelte();

		const {
			orbitControls,
			trackballControls,
			cameraControls,
			transformControls: transformControlsContext
		} = useControlsContext();

		let isDragging = false;

		// Resolve effective pause state: deprecated per-control props take
		// precedence if explicitly set, otherwise fall back to autoPauseControls.
		const shouldPauseOrbit = $.derived(() => autoPauseOrbitControls ?? autoPauseControls);

		const shouldPauseTrackball = $.derived(() => autoPauseTrackballControls ?? autoPauseControls);
		const shouldPauseCamera = $.derived(() => autoPauseControls);

		observe(() => [orbitControls, isDragging, shouldPauseOrbit()], ([orbitControls, isDragging, shouldPause]) => {
			if (!orbitControls || !orbitControls.enabled && isDragging) return;

			orbitControls.enabled = !(isDragging && shouldPause);

			return () => {
				orbitControls.enabled = true;
			};
		});

		observe(() => [trackballControls, isDragging, shouldPauseTrackball()], ([trackballControls, isDragging, shouldPause]) => {
			if (!trackballControls || !trackballControls.enabled && isDragging) return;

			trackballControls.enabled = !(isDragging && shouldPause);

			return () => {
				trackballControls.enabled = true;
			};
		});

		observe(() => [cameraControls, isDragging, shouldPauseCamera()], ([cameraControls, isDragging, shouldPause]) => {
			if (!cameraControls || !cameraControls.enabled && isDragging) return;

			cameraControls.enabled = !(isDragging && shouldPause);

			return () => {
				cameraControls.enabled = true;
			};
		});

		// Custom/third-party controls passed via the cameraControls prop
		observe(() => [customCameraControls, isDragging, autoPauseControls], ([controls, isDragging, shouldPause]) => {
			if (!controls || !controls.enabled && isDragging) return;

			controls.enabled = !(isDragging && shouldPause);

			return () => {
				controls.enabled = true;
			};
		});

		// `<HTML> sets canvas pointer-events to "none" if occluding, so events must be placed on the canvas parent.
		const transformControls = new TransformControls(camera.current, dom);

		const attachGroup = new Group();

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

		let transformProps = {};
		let objectProps = {};

		const onchange = (event) => {
			invalidate();

			if (transformControls.dragging && !isDragging) {
				isDragging = true;
			} else if (!transformControls.dragging && isDragging) {
				isDragging = false;
			}

			// TODO: unfortunately the type of the event prop is not correct *yet*
			props.onchange?.(event);
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: transformControls, onchange },
				transformProps,
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
						return controls;
					},

					set ref($$value) {
						controls = $$value;
						$$settled = false;
					}
				}
			]));

			$$renderer.push(`<!----> `);

			T($$renderer, $.spread_props([
				{ is: attachGroup },
				objectProps,
				{
					get ref() {
						return group;
					},

					set ref($$value) {
						group = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: attachGroup });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { controls, group });
	});
}