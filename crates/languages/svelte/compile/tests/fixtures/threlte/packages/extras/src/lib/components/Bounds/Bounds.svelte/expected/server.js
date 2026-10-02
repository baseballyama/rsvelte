import * as $ from 'svelte/internal/server';
import { Group } from 'three';
import { T, useThrelte } from '@threlte/core';
import { useControlsContext } from '../controls/useControlsContext.js';
import { provideBounds } from './useBounds.svelte.js';

export default function Bounds($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/* eslint-disable @typescript-eslint/no-unused-expressions */
		let {
			margin = 1,
			animate = true,
			enabled = true,
			onFit,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { camera, size } = useThrelte();
		const { orbitControls, trackballControls, cameraControls } = useControlsContext();
		const group = new Group();
		const bounds = provideBounds(() => group, () => margin, () => animate, () => onFit);
		const controls = $.derived(() => $.store_get($$store_subs ??= {}, '$cameraControls', cameraControls) ?? $.store_get($$store_subs ??= {}, '$orbitControls', orbitControls) ?? $.store_get($$store_subs ??= {}, '$trackballControls', trackballControls));

		const fit = () => {
			bounds.fit();
		};

		const reset = () => {
			bounds.reset();
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: group },
				props,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: group });
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

		$.bind_props($$props, { ref, bounds, fit, reset });
	});
}