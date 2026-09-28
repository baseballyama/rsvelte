import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { InstancedMesh } from 'three';
import Api from './Api.svelte';

export default function InstancedMesh_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = 'default',
			limit = 1000,
			range = 1000,
			update = true,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const instancedMesh = new InstancedMesh(undefined, undefined, 0);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{
					is: instancedMesh,
					raycast: () => null,
					matrixAutoUpdate: false
				},
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
						Api($$renderer, {
							instancedMesh,
							id,
							limit,
							range,
							update,
							children: ($$renderer) => {
								children?.($$renderer, { ref: instancedMesh });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
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
		$.bind_props($$props, { ref });
	});
}