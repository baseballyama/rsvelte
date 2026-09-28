import * as $ from 'svelte/internal/server';
import { ShaderMaterial } from 'three';
import { T } from '@threlte/core';

const vertexShader = `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
		}
	`;

const fragmentShader = `
		varying vec2 vUv;
		void main() {
			gl_FragColor = vec4(vUv, 0.0, 1.0);
		}
	`;

export default function UvMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, ref = void 0, $$slots, $$events, ...restProps } = $$props;
		const material = new ShaderMaterial({ fragmentShader, vertexShader });
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: material },
				restProps,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer, { ref: material });
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