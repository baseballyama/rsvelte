import * as $ from 'svelte/internal/server';
import { ExtrudeGeometry, Shape } from 'three';
import { T } from '@threlte/core';
import { toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export default function RoundedBoxGeometry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			args = [],
			radius = 0.05,
			smoothness = 4,
			creaseAngle = 0.4,
			steps = 1,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const eps = 0.00001;

		const createShape = (width, height, radius0) => {
			const shape = new Shape();
			const radius = radius0 - eps;

			shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
			shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
			shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
			shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

			return shape;
		};

		let width = $.derived(() => args[0] ?? 1);
		let height = $.derived(() => args[1] ?? 1);
		let depth = $.derived(() => args[2] ?? 1);
		let shape = $.derived(() => createShape(width(), height(), radius));

		let params = $.derived(() => ({
			depth: depth() - radius * 2,
			bevelEnabled: true,
			bevelSegments: smoothness * 2,
			steps,
			bevelSize: radius - eps,
			bevelThickness: radius,
			curveSegments: smoothness
		}));

		let geometry = $.derived(() => new ExtrudeGeometry(shape(), params()));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: geometry() },
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
						children?.($$renderer, { ref: geometry() });
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