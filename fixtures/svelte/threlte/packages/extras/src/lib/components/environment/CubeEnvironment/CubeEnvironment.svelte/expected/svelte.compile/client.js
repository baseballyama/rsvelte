import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useCache, useThrelte } from '@threlte/core';
import { CubeTextureLoader } from 'three';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { useSuspense } from '../../../suspense/useSuspense.js';
import { useEnvironment } from '../utils/useEnvironment.svelte.js';

const loaders = {};

export default function CubeEnvironment($$anchor, $$props) {
	$.push($$props, true);

	const ctx = useThrelte();

	let isBackground = $.prop($$props, 'isBackground', 3, false),
		isEnvironment = $.prop($$props, 'isEnvironment', 3, true),
		scene = $.prop($$props, 'scene', 19, () => ctx.scene),
		texture = $.prop($$props, 'texture', 15);

	const cache = useCache();
	const suspend = useSuspense();

	useEnvironment(() => scene(), () => texture(), () => isBackground(), () => isEnvironment());

	const first = $.derived(() => $$props.urls?.[0]);
	const firstIsHDR = $.derived(() => $.get(first)?.endsWith('hdr') ?? false);

	const loader = $.derived(() => {
		if ($$props.urls === undefined) return;

		if ($.get(firstIsHDR)) {
			loaders.hdr ??= new HDRCubeTextureLoader();

			return loaders.hdr;
		}

		loaders.tex ??= new CubeTextureLoader();

		return loaders.tex;
	});

	$.user_effect(() => {
		if ($$props.urls === undefined || $.get(loader) === undefined) {
			return;
		}

		const suspendedTexture = suspend(cache.remember(
			() => {
				return $.get(loader).loadAsync($$props.urls);
			},
			$$props.urls
		));

		suspendedTexture.then((t) => {
			texture(t);
		});

		return () => {
			suspendedTexture.then((texture) => {
				texture.dispose();
			});
		};
	});

	$.pop();
}