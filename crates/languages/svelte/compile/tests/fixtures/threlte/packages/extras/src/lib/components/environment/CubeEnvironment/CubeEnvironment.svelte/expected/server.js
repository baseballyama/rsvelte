import * as $ from 'svelte/internal/server';
import { useCache, useThrelte } from '@threlte/core';
import { CubeTextureLoader } from 'three';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { useSuspense } from '../../../suspense/useSuspense.js';
import { useEnvironment } from '../utils/useEnvironment.svelte.js';

const loaders = {};

export default function CubeEnvironment($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = useThrelte();

		let {
			isBackground = false,
			isEnvironment = true,
			scene = ctx.scene,
			texture = void 0,
			urls
		} = $$props;

		const cache = useCache();
		const suspend = useSuspense();

		useEnvironment(() => scene, () => texture, () => isBackground, () => isEnvironment);

		const first = $.derived(() => urls?.[0]);
		const firstIsHDR = $.derived(() => first()?.endsWith('hdr') ?? false);

		const loader = $.derived(() => {
			if (urls === undefined) return;

			if (firstIsHDR()) {
				loaders.hdr ??= new HDRCubeTextureLoader();

				return loaders.hdr;
			}

			loaders.tex ??= new CubeTextureLoader();

			return loaders.tex;
		});

		$.bind_props($$props, { texture });
	});
}