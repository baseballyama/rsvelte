import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'ref']);

export default function UvMaterial($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		restProps = $.rest_props($$props, rest_excludes);

	const material = new ShaderMaterial({ fragmentShader, vertexShader });

	T($$anchor, $.spread_props(
		{
			get is() {
				return material;
			}
		},
		() => restProps,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: material }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}