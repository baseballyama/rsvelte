import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { onDestroy } from 'svelte';
import { PositionMesh } from './PositionMesh.js';
import { useApi } from './api.js';
import { useInstanceId } from './useInstanceId.js';

export default function Instance($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useInstanceId(),
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { addInstance, removeInstance, instancedMesh, instances } = useApi(id);
		const mesh = new PositionMesh(instancedMesh, instances);

		addInstance(mesh);

		onDestroy(() => {
			removeInstance(mesh);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: mesh },
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
						children?.($$renderer, { ref: mesh });
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
		$.bind_props($$props, { ref });
	});
}