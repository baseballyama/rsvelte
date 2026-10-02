import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { Color, AdditiveBlending, ShaderMaterial } from 'three';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'falloff',
	'glowInternalRadius',
	'glowColor',
	'glowSharpness',
	'ref',
	'children'
]);

export default function FakeGlowMaterial($$anchor, $$props) {
	$.push($$props, true);

	let falloff = $.prop($$props, 'falloff', 3, 0.1),
		glowInternalRadius = $.prop($$props, 'glowInternalRadius', 3, 6.0),
		glowColor = $.prop($$props, 'glowColor', 3, 'green'),
		glowSharpness = $.prop($$props, 'glowSharpness', 3, 1.0),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const uniforms = {
		falloff: { value: falloff() },
		glowInternalRadius: { value: glowInternalRadius() },
		glowColor: { value: new Color(glowColor()) },
		glowSharpness: { value: glowSharpness() }
	};

	const material = new ShaderMaterial({
		uniforms,
		fragmentShader,
		vertexShader,
		transparent: true,
		blending: AdditiveBlending,
		depthTest: false
	});

	const { invalidate } = useThrelte();

	$.user_pre_effect(() => {
		material.uniforms.falloff.value = falloff();
		invalidate();
	});

	$.user_pre_effect(() => {
		material.uniforms.glowInternalRadius.value = glowInternalRadius();
		invalidate();
	});

	$.user_pre_effect(() => {
		material.uniforms.glowColor.value.set(glowColor());
		invalidate();
	});

	$.user_pre_effect(() => {
		material.uniforms.glowSharpness.value = glowSharpness();
		invalidate();
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return material;
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
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: material }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}