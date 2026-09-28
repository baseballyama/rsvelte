import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'count',
	'radius',
	'depth',
	'factor',
	'saturation',
	'lightness',
	'speed',
	'fade',
	'opacity',
	'rounded',
	'ref',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Stars($$anchor, $$props) {
	$.push($$props, true);

	let count = $.prop($$props, 'count', 3, 5000),
		radius = $.prop($$props, 'radius', 3, 50),
		depth = $.prop($$props, 'depth', 3, 50),
		factor = $.prop($$props, 'factor', 3, 6),
		saturation = $.prop($$props, 'saturation', 3, 1),
		lightness = $.prop($$props, 'lightness', 3, 0.8),
		speed = $.prop($$props, 'speed', 3, 0),
		fade = $.prop($$props, 'fade', 3, true),
		opacity = $.prop($$props, 'opacity', 3, 1.0),
		rounded = $.prop($$props, 'rounded', 3, false),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { invalidate } = useThrelte();
	const points = new Points();
	const vec3 = new Vector3();
	const color = new Color();
	const geometry = new BufferGeometry();
	const positions = $.derived(() => new BufferAttribute(new Float32Array(count() * 3), 3));
	const colors = $.derived(() => new BufferAttribute(new Float32Array(count() * 3), 3));
	const sizes = $.derived(() => new BufferAttribute(new Float32Array(count()), 1));
	const phases = $.derived(() => new BufferAttribute(new Float32Array(count()), 1));

	$.user_effect(() => {
		geometry.setAttribute('position', $.get(positions));
		geometry.setAttribute('color', $.get(colors));
		geometry.setAttribute('size', $.get(sizes));
		geometry.setAttribute('phase', $.get(phases));
	});

	$.user_effect(() => {
		for (let i = 0; i < count(); i += 1) {
			$.get(phases).setX(i, Math.random());
		}

		$.get(phases).needsUpdate = true;
		invalidate();
	});

	$.user_effect(() => {
		const increment = depth() / count();
		let totalRadius = radius() + depth();

		for (let i = 0; i < count(); i += 1) {
			totalRadius -= increment * Math.random();

			const position = vec3.randomDirection().multiplyScalar(totalRadius);

			$.get(positions).setXYZ(i, position.x, position.y, position.z);
		}

		$.get(positions).needsUpdate = true;
		invalidate();
	});

	$.user_effect(() => {
		for (let i = 0; i < count(); i += 1) {
			$.get(sizes).setX(i, (0.5 + 0.5 * Math.random()) * factor());
		}

		$.get(sizes).needsUpdate = true;
		invalidate();
	});

	$.user_effect(() => {
		for (let i = 0; i < count(); i += 1) {
			color.setHSL(i / count(), saturation(), lightness());
			$.get(colors).setXYZ(i, color.r, color.g, color.b);
		}

		$.get(colors).needsUpdate = true;
		invalidate();
	});

	const uniforms = {
		time: new Uniform(0),
		fade: new Uniform(1),
		opacity: new Uniform(1),
		rounded: new Uniform(0)
	};

	const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });

	useTask(
		(dt) => {
			uniforms.time.value += dt * speed();
			invalidate();
		},
		{ running: () => speed() > 0, autoInvalidate: false }
	);

	$.user_effect(() => {
		uniforms.fade.value = fade() ? 1 : 0;
		invalidate();
	});

	$.user_effect(() => {
		uniforms.opacity.value = opacity();
		invalidate();
	});

	$.user_effect(() => {
		uniforms.rounded.value = rounded() ? 1 : 0;
		invalidate();
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return points;
			}
		},
		() => props,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				T(node, {
					get is() {
						return geometry;
					}
				});

				var node_1 = $.sibling(node, 2);

				{
					let $0 = $.derived(() => rounded() || opacity() < 1);

					T(node_1, {
						get is() {
							return material;
						},

						get blending() {
							return AdditiveBlending;
						},
						depthWrite: false,
						get transparent() {
							return $.get($0);
						},
						vertexColors: true
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.snippet(node_2, () => $$props.children ?? $.noop, () => ({ ref: points }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}