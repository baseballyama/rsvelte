import 'svelte/internal/disclose-version';
import { PointsMaterial as ThreePointsMaterial } from 'three';
import { T } from '@threlte/core';
import * as $ from 'svelte/internal/client';

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

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'ref']);

export default function PointsMaterial_1($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	T($$anchor, $.spread_props(
		{
			get is() {
				return PointsMaterial;
			}
		},
		() => rest,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = $.comment();
				var node = $.first_child(fragment_2);

				$.snippet(node, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}