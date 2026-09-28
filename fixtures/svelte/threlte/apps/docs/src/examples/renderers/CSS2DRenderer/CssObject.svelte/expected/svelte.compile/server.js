import * as $ from 'svelte/internal/server';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { T } from '@threlte/core';

export default function CssObject($$renderer, $$props) {
	let {
		content,
		pointerEvents = false,
		children,
		$$slots,
		$$events,
		...props
	} = $$props;

	let element = void 0;

	$$renderer.push(`<div${$.attr_style('', {
		'pointer-events': pointerEvents ? 'auto' : 'none !important',
		'will-change': 'transform'
	})}>`);

	content?.($$renderer);
	$$renderer.push(`<!----></div> `);

	if (element !== undefined) {
		$$renderer.push('<!--[0-->');

		{
			function children($$renderer, { ref }) {
				children?.($$renderer, { ref });
			}

			T($$renderer, $.spread_props([
				props,
				{
					is: CSS2DObject,
					args: [element],
					children,
					$$slots: { default: true }
				}
			]));
		}
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}