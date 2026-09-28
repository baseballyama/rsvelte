import * as $ from 'svelte/internal/server';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';
import { T } from '@threlte/core';

export default function MeshDiscardMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, ref = void 0, $$slots, $$events, ...props } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.ShaderMaterial) {
				$$renderer.push('<!--[-->');

				T.ShaderMaterial($$renderer, $.spread_props([
					{ fragmentShader, vertexShader },
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
							children?.($$renderer, ref);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
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