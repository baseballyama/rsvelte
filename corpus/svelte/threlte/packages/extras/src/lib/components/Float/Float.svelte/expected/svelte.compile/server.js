import * as $ from 'svelte/internal/server';
import { MathUtils, Group } from 'three';
import { useTask, T } from '@threlte/core';
import { untrack } from 'svelte';

export default function Float($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			speed = 1,
			floatIntensity = 1,
			floatingRange = [-0.1, 0.1],
			rotationSpeed = 0,
			rotationIntensity = 0,
			seed = 10_000 * Math.random(),
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const outerGroup = new Group();
		const group = new Group();
		let now = untrack(() => seed);
		const map = MathUtils.mapLinear;
		let fSpeed = $.derived(() => Array.isArray(speed) ? speed : [speed, speed, speed]);

		let fIntensity = $.derived(() => Array.isArray(floatIntensity)
			? floatIntensity
			: [floatIntensity, floatIntensity, floatIntensity]);

		let fRange = $.derived(() => floatingRange.length === 3 ? floatingRange : [[0, 0], floatingRange, [0, 0]]);

		// Rotation
		let rSpeed = $.derived(() => Array.isArray(rotationSpeed)
			? rotationSpeed
			: [rotationSpeed, rotationSpeed, rotationSpeed]);

		let rIntensity = $.derived(() => Array.isArray(rotationIntensity)
			? rotationIntensity
			: [rotationIntensity, rotationIntensity, rotationIntensity]);

		useTask((delta) => {
			now += delta;
			group.position.x = map(Math.sin(now / 4 * fSpeed()[0]) / 10, -0.1, 0.1, ...fRange()[0]) * fIntensity()[0];
			group.position.y = map(Math.sin(now / 4 * fSpeed()[1]) / 10, -0.1, 0.1, ...fRange()[1]) * fIntensity()[1];
			group.position.z = map(Math.sin(now / 4 * fSpeed()[2]) / 10, -0.1, 0.1, ...fRange()[2]) * fIntensity()[2];
			group.rotation.x = Math.cos(now / 4 * rSpeed()[0]) / 8 * rIntensity()[0];
			group.rotation.y = Math.sin(now / 4 * rSpeed()[1]) / 8 * rIntensity()[1];
			group.rotation.z = Math.sin(now / 4 * rSpeed()[2]) / 20 * rIntensity()[2];
			group.updateMatrix();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: outerGroup },
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
						T($$renderer, {
							is: group,
							matrixAutoUpdate: false,
							children: ($$renderer) => {
								children?.($$renderer, { ref: group });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
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