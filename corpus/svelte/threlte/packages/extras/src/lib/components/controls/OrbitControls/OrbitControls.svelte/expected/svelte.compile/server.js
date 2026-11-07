import * as $ from 'svelte/internal/server';
import { isInstanceOf, T, useParent, useTask, useThrelte } from '@threlte/core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useControlsContext } from '../useControlsContext.js';
import { untrack } from 'svelte';

export default function OrbitControls_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { camera, ref = void 0, children, $$slots, $$events, ...props } = $$props;
		const { dom, camera: defaultCamera, invalidate } = useThrelte();
		const parent = useParent();

		const resolvedCamera = $.derived(() => camera
			? camera
			: isInstanceOf($.store_get($$store_subs ??= {}, '$parent', parent), 'Camera')
				? $.store_get($$store_subs ??= {}, '$parent', parent)
				: $.store_get($$store_subs ??= {}, '$defaultCamera', defaultCamera));

		// <HTML> sets canvas pointer-events to "none" if occluding, so events must be placed on the canvas parent.
		const controls = new OrbitControls(untrack(() => resolvedCamera()), dom);

		const { orbitControls } = useControlsContext();

		useTask(
			() => {
				controls.update();
			},
			{
				autoInvalidate: false,
				running: () => props.autoRotate || props.enableDamping || false
			}
		);

		const handleChange = (event) => {
			invalidate();
			props.onchange?.(event);
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: controls },
				props,
				{
					onchange: handleChange,
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