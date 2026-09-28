import * as $ from 'svelte/internal/server';
import { PointsMaterial as ThreePointsMaterial } from 'three';
import { T } from '@threlte/core';

const fragment = `
    #include <opaque_fragment>
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    float r = dot(cxy, cxy);
	    if (r > 1.0) discard;
	    float delta = fwidth(r);     
	    float mask = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
	    gl_FragColor.a = mask * gl_FragColor.a;
	  `;

class PointsMaterial extends ThreePointsMaterial {
	constructor() {
		super();
		this.alphaToCoverage = true;

		this.onBeforeCompile = (
			parameters,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			_renderer
		) => {
			parameters.fragmentShader = parameters.fragmentShader.replace(`#include <opaque_fragment>`, fragment);
		};
	}
}

export default function PointsMaterial_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, ref = void 0, $$slots, $$events, ...rest } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: PointsMaterial },
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
						children?.($$renderer);
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