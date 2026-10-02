import * as $ from 'svelte/internal/server';
import { T, useTask, useThrelte } from '@threlte/core';

import {
	BufferAttribute,
	BufferGeometry,
	Color,
	ShaderMaterial,
	Vector3,
	Points,
	MathUtils,
	Uniform
} from 'three';

import fragmentShader from './fragment.js';
import vertexShader from './vertex.js';

export default function Sparkles($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * Number of particles
		 *
		 * @default 100
		 */
		/**
		 * Speed of particles
		 *
		 * @default 1
		 */
		/**
		 * Opacity of particles
		 *
		 * @default 1
		 */
		/**
		 * Color of particles
		 */
		/**
		 * Size of particles
		 *
		 * @default randomized between 0 and 1
		 */
		/**
		 * The space the particles occupy
		 *
		 * @default 1
		 */
		/**
		 * Movement factor
		 *
		 * @default 1
		 */
		let {
			count = 100,
			speed,
			opacity,
			color,
			size = Math.random(),
			scale,
			noise,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const { dpr } = useThrelte();
		const vec3 = new Vector3();
		const colorUtil = new Color();
		const isFloat32Array = (def) => def && def.constructor === Float32Array;
		const geometry = new BufferGeometry();
		const uniforms = { time: new Uniform(0), pixelRatio: new Uniform(1) };

		const material = new ShaderMaterial({
			uniforms,
			vertexShader,
			fragmentShader,
			transparent: true,
			depthWrite: false
		});

		let elapsed = 0;

		useTask((dt) => {
			elapsed += dt;
			uniforms.time.value = elapsed;
		});

		const points = new Points();

		T($$renderer, $.spread_props([
			{ is: points },
			rest,
			{
				children: ($$renderer) => {
					T($$renderer, { is: material });
					$$renderer.push(`<!----> `);
					T($$renderer, { is: geometry });
					$$renderer.push(`<!----> `);
					children?.($$renderer, { ref: points });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}