import * as $ from 'svelte/internal/server';
import { T, useTask, useParent, useThrelte, isInstanceOf } from '@threlte/core';

import {
	Box3,
	Matrix4,
	Quaternion,
	Raycaster,
	Sphere,
	Spherical,
	Vector2,
	Vector3,
	Vector4
} from 'three';

import CameraControls from 'camera-controls';
import { useControlsContext } from '../controls/useControlsContext.js';
import { untrack } from 'svelte';

export { default as CameraControlsRef } from 'camera-controls';

let installed = false;

const install = () => {
	if (installed) {
		return;
	}

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
			Raycaster
		}
	});

	installed = true;
};

export default function CameraControls_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		install();

		let {
			ref = void 0,
			camera: userCamera,
			pointerLock = false,
			pointerLockSensitivity = 0.003,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const { dom, camera: defaultCamera, invalidate } = useThrelte();
		const { cameraControls } = useControlsContext();
		const parent = useParent();

		const camera = $.derived(() => {
			if (userCamera) {
				return userCamera;
			}

			if (isInstanceOf($.store_get($$store_subs ??= {}, '$parent', parent), 'PerspectiveCamera') || isInstanceOf($.store_get($$store_subs ??= {}, '$parent', parent), 'OrthographicCamera')) {
				return $.store_get($$store_subs ??= {}, '$parent', parent);
			}

			return $.store_get($$store_subs ??= {}, '$defaultCamera', defaultCamera);
		});

		const controls = new CameraControls(untrack(() => camera()), dom);

		useTask(
			(delta) => {
				if (!controls.enabled) {
					return;
				}

				if (controls.update(delta)) {
					invalidate();
				}
			},
			{ autoInvalidate: false }
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: controls },
				rest,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: controls });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}