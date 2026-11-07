import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';

import {
	atan,
	Fn,
	frontFacing,
	If,
	output,
	PI2,
	positionLocal,
	uniform,
	vec4
} from 'three/tsl';

import { Color } from 'three/webgpu';

const defaultStartAngle = 0;
const defaultArcAngle = 0.5 * Math.PI;
const defaultColor = 'black';

export default function SliceMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			arcAngle = defaultArcAngle,
			sliceColor = defaultColor,
			startAngle = defaultStartAngle,
			ref = void 0,
			$$slots,
			$$events,
			...props
		} = $$props;

		const uArcAngle = uniform(defaultArcAngle);
		const uColor = uniform(new Color(defaultColor));
		const uStartAngle = uniform(defaultStartAngle);
		const angle = atan(positionLocal.y, positionLocal.x).sub(uStartAngle).mod(PI2);
		const inAngle = angle.greaterThan(0).and(angle.lessThan(uArcAngle));

		const outputNodeFn = Fn(() => {
			inAngle.discard();

			If(frontFacing.not(), () => {
				output.assign(vec4(uColor, 1.0));
			});

			return output;
		});

		const shadow = vec4(0.0, 0.0, 0.0, 1.0);

		const castShadowNodeFn = Fn(() => {
			inAngle.discard();

			return shadow;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (T.MeshPhysicalNodeMaterial) {
				$$renderer.push('<!--[-->');

				T.MeshPhysicalNodeMaterial($$renderer, $.spread_props([
					{
						outputNode: outputNodeFn(),
						castShadowNode: castShadowNodeFn()
					},
					props,
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
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