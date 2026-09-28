import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { PlaneGeometry } from 'three';

export default function BackdropGeometry($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			length = 1,
			segments = 20,
			ref = void 0,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const easeInExpo = (x) => {
			return +(x !== 0) * 2 ** (10 * x - 10);
		};

		const geometry = $.derived(() => {
			const geometry = new PlaneGeometry(1, 1, segments, segments);
			const position = geometry.getAttribute('position');
			const s = segments + 1;
			const offset = 0.5;
			let i = 0;

			for (let x = 0; x < s; x += 1) {
				for (let y = 0; y < s; y += 1) {
					const xOverSegments = x / segments;

					position.setXYZ(i, xOverSegments - offset + +(x === 0) * -1 * length, y / segments - offset, easeInExpo(xOverSegments));
					i += 1;
				}
			}

			position.needsUpdate = true;
			geometry.computeVertexNormals();
			geometry.rotateZ(0.5 * Math.PI);
			geometry.rotateX(-0.5 * Math.PI);

			return geometry;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: geometry() },
				rest,
				{
					get ref() {
						return ref;
					},

					set ref($$value) {
						ref = $$value;
						$$settled = false;
					}
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