import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { useGltf } from '../../hooks/useGltf.js';
import { useSuspense } from '../../suspense/useSuspense.js';

export default function GLTF($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			url,
			dracoLoader,
			meshoptDecoder,
			ktx2Loader,
			gltf = void 0,
			scene = void 0,
			animations = void 0,
			asset = void 0,
			cameras = void 0,
			scenes = void 0,
			userData = void 0,
			parser = void 0,
			materials = void 0,
			nodes = void 0,
			onload,
			onunload,
			onerror,
			children,
			$$slots,
			$$events,
			...props
		} = $$props;

		const loader = useGltf({ dracoLoader, meshoptDecoder, ktx2Loader });

		const onLoad = (data) => {
			if (gltf) onunload?.();

			gltf = data;
			scene = data.scene;
			animations = data.animations;
			asset = data.asset;
			cameras = data.cameras;
			scenes = data.scenes;
			userData = data.userData;
			parser = data.parser;
			materials = data.materials;
			nodes = data.nodes;
			onload?.(gltf);
		};

		const onError = (error) => {
			gltf = undefined;
			scene = undefined;
			animations = undefined;
			asset = undefined;
			cameras = undefined;
			scenes = undefined;
			userData = undefined;
			parser = undefined;
			nodes = undefined;
			materials = undefined;
			onerror?.(error);
		};

		const suspend = useSuspense();

		const loadGltf = async (url) => {
			try {
				// eslint-disable-next-line svelte/require-store-reactive-access
				const model = await suspend(loader.load(url));

				onLoad(model);
			} catch(error) {
				onError(error);
			}
		};

		if (scene) {
			$$renderer.push('<!--[0-->');

			T($$renderer, $.spread_props([
				{ is: scene },
				props,
				{
					children: ($$renderer) => {
						children?.($$renderer, { ref: scene });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		$.bind_props($$props, {
			gltf,
			scene,
			animations,
			asset,
			cameras,
			scenes,
			userData,
			parser,
			materials,
			nodes
		});
	});
}