import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Color, DoubleSide, ShaderMaterial } from 'three';
import { T } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Cursor($$anchor, $$props) {
	$.push($$props, true);

	const color = $.prop($$props, 'color', 19, () => new Color('white')),
		size = $.prop($$props, 'size', 3, 0.03),
		thickness = $.prop($$props, 'thickness', 3, 0.035);

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

	const uniforms = { thickness: { value: thickness() }, color: { value: color() } };

	const shaderMaterial = new ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms,
		side: DoubleSide,
		transparent: true,
		depthTest: false
	});

	$.user_pre_effect(() => {
		uniforms.thickness.value = thickness();
	});

	$.user_pre_effect(() => {
		uniforms.color.value = color();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get scale() {
				return size();
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, {});
				});

				var node_2 = $.sibling(node_1, 2);

				T(node_2, {
					get is() {
						return shaderMaterial;
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}