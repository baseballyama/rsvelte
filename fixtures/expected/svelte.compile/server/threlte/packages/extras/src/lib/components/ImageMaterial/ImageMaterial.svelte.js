import * as $ from 'svelte/internal/server';

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

export default function ImageMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			color = 'white',
			zoom = 1,
			radius = 0,
			alphaThreshold = 0,
			alphaSmoothing = 0.1,
			brightness = 0,
			contrast = 0,
			hue = 0,
			saturation = 0,
			lightness = 0,
			negative = false,
			opacity = 1,
			toneMapped = true,
			transparent = false,
			texture,
			monochromeColor,
			monochromeStrength,
			colorProcessingTexture,
			side,
			url,
			ref = void 0,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const { invalidate, size } = useThrelte();
		const suspend = useSuspense();

		const textureStore = suspend(url
			? useTexture(url)
			: asyncWritable(Promise.resolve(texture)));

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

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			T($$renderer, $.spread_props([
				{ is: material, toneMapped, transparent },
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
						children?.($$renderer, { ref: material });
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref });
	});
}