import * as $ from 'svelte/internal/server';
import { T, useCache, useThrelte } from '@threlte/core';
import { EquirectangularReflectionMapping, TextureLoader } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js';
import { useSuspense } from '../../../suspense/useSuspense.js';
import { useEnvironment } from '../utils/useEnvironment.svelte.js';

const loaders = {};

export default function Environment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = useThrelte();

		let {
			skybox = void 0,
			texture = void 0,
			ground = false,
			isBackground = false,
			isEnvironment = true,
			scene = ctx.scene,
			url
		} = $$props;

		const suspend = useSuspense();
		const cache = useCache();

		useEnvironment(() => scene, () => texture, () => isBackground, () => isEnvironment);

		const isEXR = $.derived(() => url?.endsWith('exr') ?? false);
		const isHDR = $.derived(() => url?.endsWith('hdr') ?? false);

		const loader = $.derived(() => {
			if (isEXR()) {
				loaders.exr ??= new EXRLoader();

				return loaders.exr;
			}

			if (isHDR()) {
				loaders.hdr ??= new RGBELoader();

				return loaders.hdr;
			}

			loaders.tex ??= new TextureLoader();

			return loaders.tex;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (ground) {
				$$renderer.push('<!--[0-->');

				const options = ground === true ? {} : ground;

				if (texture) {
					$$renderer.push('<!--[0-->');

					T($$renderer, {
						is: GroundedSkybox,
						args: [
							texture,
							options.height ?? 1,
							options.radius ?? 1,
							options.resolution ?? 128
						],

						get ref() {
							return skybox;
						},

						set ref($$value) {
							skybox = $$value;
							$$settled = false;
						}
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { skybox, texture });
	});
}