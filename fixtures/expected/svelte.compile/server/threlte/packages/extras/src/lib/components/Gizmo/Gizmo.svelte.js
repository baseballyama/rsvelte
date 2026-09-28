import * as $ from 'svelte/internal/server';
import { useTask, useThrelte, useParent, observe } from '@threlte/core';
import { NoToneMapping, Vector4 } from 'three';
import { ViewportGizmo } from 'three-viewport-gizmo';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

export default function Gizmo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			controls,
			renderTask,
			ref = void 0,
			onstart,
			onchange,
			onend,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const parent = useParent();

		const {
			camera,
			renderer,
			dom,
			autoRenderTask,
			shouldRender,
			size,
			invalidate
		} = useThrelte();

		const gizmo = $.derived(() => {
			invalidate();

			return new ViewportGizmo(camera.current, renderer, { container: dom, placement: 'bottom-left', size: 86, ...rest });
		});

		const viewport = new Vector4();
		const cameraControls = $.derived(() => controls ?? $.store_get($$store_subs ??= {}, '$parent', parent));

		useTask(
			renderTask?.key ?? Symbol('threlte-extras-gizmo-render'),
			() => {
				if (shouldRender()) {
					const toneMapping = renderer.toneMapping;

					renderer.getViewport(viewport);
					renderer.toneMapping = NoToneMapping;
					gizmo().render();
					renderer.setViewport(viewport);
					renderer.toneMapping = toneMapping;
				}
			},
			{
				autoInvalidate: false,
				...renderTask ?? { after: autoRenderTask }
			}
		);

		const handleStart = (event) => {
			cameraControls().enabled = false;
			onstart?.(event);
		};

		const handleChange = (event) => {
			invalidate();
			onchange?.(event);
		};

		const handleEnd = (event) => {
			cameraControls().enabled = true;
			onend?.(event);
		};

		observe.pre(() => [size], () => {
			gizmo().update();
			invalidate();
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}