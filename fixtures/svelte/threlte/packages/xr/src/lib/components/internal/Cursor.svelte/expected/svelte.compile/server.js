import * as $ from 'svelte/internal/server';
import { Color, DoubleSide, ShaderMaterial } from 'three';
import { T } from '@threlte/core';

export default function Cursor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { color = new Color('white'), size = 0.03, thickness = 0.035 } = $$props;

		const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

		const fragmentShader = `
    uniform float thickness;
    uniform vec3 color;
    varying vec2 vUv;
    void main() {
      float d = abs(distance(vUv, vec2(0.5)) - 0.25);
      float edge = fwidth(d);
      float alpha = 1.0 - smoothstep(thickness - edge, thickness + edge, d);
      gl_FragColor = vec4(color, alpha);
    }
  `;

		const uniforms = { thickness: { value: thickness }, color: { value: color } };

		const shaderMaterial = new ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms,
			side: DoubleSide,
			transparent: true,
			depthTest: false
		});

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				scale: size,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					T($$renderer, { is: shaderMaterial });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}