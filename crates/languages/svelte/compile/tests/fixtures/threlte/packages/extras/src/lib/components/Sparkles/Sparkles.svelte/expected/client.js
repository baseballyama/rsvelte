import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'count',
	'speed',
	'opacity',
	'color',
	'size',
	'scale',
	'noise',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Sparkles($$anchor, $$props) {
	$.push($$props, true);

	const $dpr = () => $.store_get(dpr, '$dpr', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
	let count = $.prop($$props, 'count', 3, 100),
		size = $.prop($$props, 'size', 19, () => Math.random()),
		rest = $.rest_props($$props, rest_excludes);

	const { dpr } = useThrelte();
	const vec3 = new Vector3();
	const colorUtil = new Color();
	const isFloat32Array = (def) => def && def.constructor === Float32Array;
	const geometry = new BufferGeometry();

	$.user_effect(() => {
		if (Array.isArray($$props.scale)) {
			vec3.fromArray($$props.scale);
		} else {
			vec3.setScalar($$props.scale ?? 1);
		}

		const positions = new Float32Array(count() * 3);

		for (let i = 0, l = count() * 3; i < l; i += 3) {
			positions[i + 0] = MathUtils.randFloatSpread(vec3.x);
			positions[i + 1] = MathUtils.randFloatSpread(vec3.y);
			positions[i + 2] = MathUtils.randFloatSpread(vec3.z);
		}

		geometry.setAttribute('position', new BufferAttribute(positions, 3));
	});

	$.user_effect(() => {
		const array = typeof size() === 'number'
			? new Float32Array(count()).fill(size())
			: size() === undefined
				? Float32Array.from({ length: count() }, () => Math.random())
				: size();

		geometry.setAttribute('size', new BufferAttribute(array, 1));
	});

	$.user_effect(() => {
		const array = typeof $$props.speed === 'number'
			? new Float32Array(count()).fill($$props.speed)
			: $$props.speed === undefined
				? Float32Array.from({ length: count() }, () => Math.random())
				: $$props.speed;

		geometry.setAttribute('speed', new BufferAttribute(array, 1));
	});

	$.user_effect(() => {
		const array = typeof $$props.opacity === 'number'
			? new Float32Array(count()).fill($$props.opacity)
			: $$props.opacity === undefined
				? Float32Array.from({ length: count() }, () => Math.random())
				: $$props.opacity;

		geometry.setAttribute('opacity', new BufferAttribute(array, 1));
	});

	$.user_effect(() => {
		const array = typeof $$props.noise === 'number'
			? new Float32Array(count() * 3).fill($$props.noise)
			: $$props.noise === undefined
				? Float32Array.from({ length: count() * 3 }, () => Math.random())
				: Array.isArray($$props.noise)
					? Float32Array.from({ length: count() * 3 }, (_, k) => $$props.noise[k % 3])
					: $$props.noise;

		geometry.setAttribute('noise', new BufferAttribute(array, 3));
	});

	$.user_effect(() => {
		if (isFloat32Array($$props.color)) {
			geometry.setAttribute('color', new BufferAttribute($$props.color, 3));
		} else {
			colorUtil.set($$props.color ?? 'white');

			const colorArray = colorUtil.toArray();
			const array = Float32Array.from({ length: count() * 3 }, (_, k) => colorArray[k % 3]);

			geometry.setAttribute('color', new BufferAttribute(array, 3));
		}
	});

	const uniforms = { time: new Uniform(0), pixelRatio: new Uniform(1) };

	const material = new ShaderMaterial({
		uniforms,
		vertexShader,
		fragmentShader,
		transparent: true,
		depthWrite: false
	});

	$.user_effect(() => {
		uniforms.pixelRatio.value = $dpr();
	});

	let elapsed = 0;

	useTask((dt) => {
		elapsed += dt;
		uniforms.time.value = elapsed;
	});

	const points = new Points();

	T($$anchor, $.spread_props(
		{
			get is() {
				return points;
			}
		},
		() => rest,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				T(node, {
					get is() {
						return material;
					}
				});

				var node_1 = $.sibling(node, 2);

				T(node_1, {
					get is() {
						return geometry;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ ref: points }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
	$$cleanup();
}