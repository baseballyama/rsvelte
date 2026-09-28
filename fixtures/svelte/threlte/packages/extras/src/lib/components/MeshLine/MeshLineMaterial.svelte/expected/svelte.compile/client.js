import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useThrelte } from '@threlte/core';
import { ShaderMaterial, Color, Vector2, Uniform, Texture } from 'three';
import { fragmentShader } from './fragment.js';
import { vertexShader } from './vertex.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'opacity',
	'color',
	'dashOffset',
	'dashArray',
	'dashRatio',
	'attenuate',
	'width',
	'scaleDown',
	'alphaMap',
	'ref',
	'children'
]);

export default function MeshLineMaterial($$anchor, $$props) {
	$.push($$props, true);

	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let opacity = $.prop($$props, 'opacity', 3, 1),
		color = $.prop($$props, 'color', 3, '#ffffff'),
		dashOffset = $.prop($$props, 'dashOffset', 3, 0),
		dashArray = $.prop($$props, 'dashArray', 3, 0),
		dashRatio = $.prop($$props, 'dashRatio', 3, 0),
		attenuate = $.prop($$props, 'attenuate', 3, true),
		width = $.prop($$props, 'width', 3, 1),
		scaleDown = $.prop($$props, 'scaleDown', 3, 0),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	let { invalidate, size } = useThrelte();

	const uniforms = {
		lineWidth: new Uniform(1),
		color: new Uniform(new Color('#ffffff')),
		opacity: new Uniform(1),
		resolution: new Uniform(new Vector2(1, 1)),
		sizeAttenuation: new Uniform(1),
		dashArray: new Uniform(0),
		useDash: new Uniform(0),
		dashOffset: new Uniform(0),
		dashRatio: new Uniform(0),
		scaleDown: new Uniform(0),
		alphaMap: new Uniform(undefined),
		useAlphaMap: new Uniform(0)
	};

	const material = new ShaderMaterial({ uniforms });

	$.user_pre_effect(() => {
		uniforms.lineWidth.value = width();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.opacity.value = opacity();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.resolution.value.set($size().width, $size().height);
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.sizeAttenuation.value = attenuate() ? 1 : 0;
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.dashArray.value = dashArray();
		uniforms.useDash.value = dashArray() > 0 ? 1 : 0;
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.dashOffset.value = dashOffset();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.dashRatio.value = dashRatio();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.scaleDown.value = scaleDown() / 10;
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.alphaMap.value = $$props.alphaMap;
		uniforms.useAlphaMap.value = $$props.alphaMap ? 1 : 0;
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.color.value.set(color());
		invalidate();
	});

	var $$exports = { material };

	T($$anchor, $.spread_props(
		{
			get is() {
				return material;
			},

			get fragmentShader() {
				return fragmentShader;
			},

			get vertexShader() {
				return vertexShader;
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

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}