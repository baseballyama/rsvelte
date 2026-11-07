import * as $ from 'svelte/internal/server';
import { Group } from 'three';
import { T, useThrelte } from '@threlte/core';
import { useXROrigin } from '../hooks/useXROrigin.svelte.js';
import { isPresenting } from '../internal/state.svelte.js';

export default function XROrigin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { ref = void 0, children, $$slots, $$events, ...rest } = $$props;
		const { camera, scene } = useThrelte();
		const group = new Group();
		const origin = useXROrigin();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: group },
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

		$.bind_props($$props, { ref });
	});
}