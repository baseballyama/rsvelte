import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { BufferGeometry, BufferAttribute } from 'three';

export default function MeshLineGeometry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			points = [],
			shape = 'none',
			shapeFunction: shapeFn = () => 1,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const pointCount = $.derived(() => points.length);
		const { invalidate } = useThrelte();
		const positions = $.derived(() => new BufferAttribute(new Float32Array(pointCount() * 6), 3));
		const previous = $.derived(() => new BufferAttribute(new Float32Array(pointCount() * 6), 3));
		const next = $.derived(() => new BufferAttribute(new Float32Array(pointCount() * 6), 3));
		const counters = $.derived(() => new BufferAttribute(new Float32Array(pointCount() * 2), 1));
		const side = $.derived(() => new BufferAttribute(new Float32Array(pointCount() * 2), 1));
		const width = $.derived(() => new BufferAttribute(new Float32Array(pointCount() * 2), 1));
		const uv = $.derived(() => new BufferAttribute(new Float32Array(pointCount() * 4), 2));
		const indices = $.derived(() => new BufferAttribute(new Uint32Array(pointCount() * 6), 1));
		const shapeFunction = $.derived(() => shape === 'taper' ? (p) => 4 * p * (1 - p) : shapeFn);
		const geometry = new BufferGeometry();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: geometry },
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
						children?.($$renderer, { ref: geometry });
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