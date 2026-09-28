import * as $ from 'svelte/internal/server';
import { T, isInstanceOf, useParent } from '@threlte/core';
import { fromStore } from 'svelte/store';
import { LineSegments } from 'three';

export default function Edges($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			thresholdAngle = 1,
			color = '#ffffff',
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const parent = fromStore(useParent());

		const geometry = $.derived(() => {
			if (!isInstanceOf(parent.current, 'Mesh')) {
				throw new Error('Edges: component must be a child of a Mesh');
			}

			return parent.current.geometry;
		});

		const segments = new LineSegments();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: segments },
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
						if (T.EdgesGeometry) {
							$$renderer.push('<!--[-->');
							T.EdgesGeometry($$renderer, { args: [geometry(), thresholdAngle] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.LineBasicMaterial) {
							$$renderer.push('<!--[-->');
							T.LineBasicMaterial($$renderer, { color });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);
						children?.($$renderer, { ref: segments });
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