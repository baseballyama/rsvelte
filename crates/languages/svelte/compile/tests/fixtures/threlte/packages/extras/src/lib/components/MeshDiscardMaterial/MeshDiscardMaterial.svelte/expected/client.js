import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';
import { T } from '@threlte/core';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'ref']);

export default function MeshDiscardMaterial($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.ShaderMaterial, ($$anchor, T_ShaderMaterial) => {
		T_ShaderMaterial($$anchor, $.spread_props(
			{
				get fragmentShader() {
					return fragmentShader;
				},

				get vertexShader() {
					return vertexShader;
				}
			},
			() => props,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.snippet(node_1, () => $$props.children ?? $.noop, ref);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}