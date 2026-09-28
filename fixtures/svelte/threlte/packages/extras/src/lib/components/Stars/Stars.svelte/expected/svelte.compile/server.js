import * as $ from 'svelte/internal/server';

import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	Points,
	ShaderMaterial,
	Uniform,
	Vector3
} from 'three';

import { T, useTask, useThrelte } from '@threlte/core';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';

export default function Stars($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			count = 5000,
			radius = 50,
			depth = 50,
			factor = 6,
			saturation = 1,
			lightness = 0.8,
			speed = 0,
			fade = true,
			opacity = 1.0,
			rounded = false,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { invalidate } = useThrelte();
		const points = new Points();
		const vec3 = new Vector3();
		const color = new Color();
		const geometry = new BufferGeometry();
		const positions = $.derived(() => new BufferAttribute(new Float32Array(count * 3), 3));
		const colors = $.derived(() => new BufferAttribute(new Float32Array(count * 3), 3));
		const sizes = $.derived(() => new BufferAttribute(new Float32Array(count), 1));
		const phases = $.derived(() => new BufferAttribute(new Float32Array(count), 1));

		const uniforms = {
			time: new Uniform(0),
			fade: new Uniform(1),
			opacity: new Uniform(1),
			rounded: new Uniform(0)
		};

		const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });

		useTask(
			(dt) => {
				uniforms.time.value += dt * speed;
				invalidate();
			},
			{ running: () => speed > 0, autoInvalidate: false }
		);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: points },
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
						T($$renderer, { is: geometry });
						$$renderer.push(`<!----> `);

						T($$renderer, {
							is: material,
							blending: AdditiveBlending,
							depthWrite: false,
							transparent: rounded || opacity < 1,
							vertexColors: true
						});

						$$renderer.push(`<!----> `);
						children?.($$renderer, { ref: points });
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