import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	T,
	asyncWritable,
	isInstanceOf,
	useParent,
	useTask,
	useThrelte
} from '@threlte/core';

import { Color, ShaderMaterial, Uniform, Vector2, Vector3 } from 'three';
import { useTexture } from '../../hooks/useTexture.js';
import { useSuspense } from '../../suspense/useSuspense.js';
import { fragmentShader, vertexShader } from './shaders.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'color',
	'zoom',
	'radius',
	'alphaThreshold',
	'alphaSmoothing',
	'brightness',
	'contrast',
	'hue',
	'saturation',
	'lightness',
	'negative',
	'opacity',
	'toneMapped',
	'transparent',
	'texture',
	'monochromeColor',
	'monochromeStrength',
	'colorProcessingTexture',
	'side',
	'url',
	'ref',
	'children'
]);

export default function ImageMaterial($$anchor, $$props) {
	$.push($$props, true);

	const $textureStore = () => $.store_get(textureStore, '$textureStore', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let color = $.prop($$props, 'color', 3, 'white'),
		zoom = $.prop($$props, 'zoom', 3, 1),
		radius = $.prop($$props, 'radius', 3, 0),
		alphaThreshold = $.prop($$props, 'alphaThreshold', 3, 0),
		alphaSmoothing = $.prop($$props, 'alphaSmoothing', 3, 0.1),
		brightness = $.prop($$props, 'brightness', 3, 0),
		contrast = $.prop($$props, 'contrast', 3, 0),
		hue = $.prop($$props, 'hue', 3, 0),
		saturation = $.prop($$props, 'saturation', 3, 0),
		lightness = $.prop($$props, 'lightness', 3, 0),
		negative = $.prop($$props, 'negative', 3, false),
		opacity = $.prop($$props, 'opacity', 3, 1),
		toneMapped = $.prop($$props, 'toneMapped', 3, true),
		transparent = $.prop($$props, 'transparent', 3, false),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const { invalidate, size } = useThrelte();
	const suspend = useSuspense();

	const textureStore = suspend($$props.url
		? useTexture($$props.url)
		: asyncWritable(Promise.resolve($$props.texture)));

	const parent = useParent();

	const uniforms = {
		color: new Uniform(new Color()),
		scale: new Uniform(new Vector2()),
		imageBounds: new Uniform(new Vector2(1, 1)),
		resolution: new Uniform(1024),
		map: new Uniform(null),
		zoom: new Uniform(1),
		radius: new Uniform(0),
		alphaThreshold: new Uniform(0),
		alphaSmoothing: new Uniform(0.1),
		brightness: new Uniform(0),
		contrast: new Uniform(0),
		monochromeColor: new Uniform(new Color()),
		monochromeStrength: new Uniform(0),
		negative: new Uniform(0),
		opacity: new Uniform(1),
		hsl: new Uniform(new Vector3()),
		colorProccessingTexture: new Uniform(null),
		colorProcessingTextureOverride: new Uniform(0),
		colorProcessingEnabled: new Uniform(1)
	};

	const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });

	$.user_pre_effect(() => {
		if ($$props.side) {
			material.side = $$props.side;
			invalidate();
		}
	});

	$.user_pre_effect(() => {
		uniforms.color.value.set(color());
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.imageBounds.value.set($textureStore()?.image.width ?? 0, $textureStore()?.image.height ?? 0);
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.resolution.value = Math.max($size().width, $size().height);
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.zoom.value = zoom();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.radius.value = radius();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.opacity.value = opacity();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.alphaThreshold.value = alphaThreshold();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.alphaSmoothing.value = alphaSmoothing();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.brightness.value = brightness();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.contrast.value = contrast();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.hsl.value.x = hue();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.hsl.value.z = lightness();
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.negative.value = negative() ? 1 : 0;
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.map.value = $textureStore() ?? null;
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.colorProccessingTexture.value = $$props.colorProcessingTexture ?? null;
		invalidate();
	});

	$.user_pre_effect(() => {
		uniforms.colorProcessingTextureOverride.value = $$props.colorProcessingTexture ? 1 : 0;
		invalidate();
	});

	$.user_pre_effect(() => {
		if ($$props.monochromeColor !== undefined) {
			uniforms.monochromeColor.value.set($$props.monochromeColor);
			uniforms.monochromeStrength.value = $$props.monochromeStrength ?? 1;
		} else {
			uniforms.monochromeStrength.value = 0;
		}

		invalidate();
	});

	$.user_pre_effect(() => {
		let colorProcessingEnabled = 0;
		const monochromeCheck = ($$props.monochromeColor ? 1 : 0) * ($$props.monochromeStrength === undefined ? 1 : $$props.monochromeStrength);

		for (const value of [
			brightness(),
			contrast(),
			hue(),
			saturation(),
			lightness(),
			monochromeCheck,
			$$props.colorProcessingTexture ? 1 : 0
		]) {
			if (value !== 0) {
				colorProcessingEnabled = 1;

				break;
			}
		}

		uniforms.colorProcessingEnabled.value = colorProcessingEnabled;
		invalidate();
	});

	useTask(
		() => {
			const mesh = parent.current;

			if (!isInstanceOf(mesh, 'Mesh')) return;

			uniforms.scale.value.set(mesh.scale.x, mesh.scale.y);

			const geometry = mesh.geometry;

			// Support arbitrary plane geometries (for instance with rounded corners)
			if (geometry !== undefined && 'parameters' in geometry) {
				const { width, height } = geometry.parameters;

				uniforms.scale.value.set(uniforms.scale.value.x * width, uniforms.scale.value.y * height);
			}
		},
		{ autoInvalidate: false }
	);

	T($$anchor, $.spread_props(
		{
			get is() {
				return material;
			},

			get toneMapped() {
				return toneMapped();
			},

			get transparent() {
				return transparent();
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
	$$cleanup();
}