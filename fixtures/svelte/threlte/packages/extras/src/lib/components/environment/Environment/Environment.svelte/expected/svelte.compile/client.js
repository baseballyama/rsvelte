import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useCache, useThrelte } from '@threlte/core';
import { EquirectangularReflectionMapping, TextureLoader } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js';
import { useSuspense } from '../../../suspense/useSuspense.js';
import { useEnvironment } from '../utils/useEnvironment.svelte.js';

const loaders = {};

export default function Environment($$anchor, $$props) {
	$.push($$props, true);

	const ctx = useThrelte();

	let skybox = $.prop($$props, 'skybox', 15),
		texture = $.prop($$props, 'texture', 15),
		ground = $.prop($$props, 'ground', 3, false),
		isBackground = $.prop($$props, 'isBackground', 3, false),
		isEnvironment = $.prop($$props, 'isEnvironment', 3, true),
		scene = $.prop($$props, 'scene', 19, () => ctx.scene);

	const suspend = useSuspense();
	const cache = useCache();

	useEnvironment(() => scene(), () => texture(), () => isBackground(), () => isEnvironment());

	const isEXR = $.derived(() => $$props.url?.endsWith('exr') ?? false);
	const isHDR = $.derived(() => $$props.url?.endsWith('hdr') ?? false);

	const loader = $.derived(() => {
		if ($.get(isEXR)) {
			loaders.exr ??= new EXRLoader();

			return loaders.exr;
		}

		if ($.get(isHDR)) {
			loaders.hdr ??= new RGBELoader();

			return loaders.hdr;
		}

		loaders.tex ??= new TextureLoader();

		return loaders.tex;
	});

	$.user_pre_effect(() => {
		if ($$props.url === undefined) return;

		const suspendedTexture = suspend(cache.remember(
			() => {
				return $.get(loader).loadAsync($$props.url);
			},
			[$$props.url]
		));

		suspendedTexture.then((t) => {
			t.mapping = EquirectangularReflectionMapping;
			texture(t);
		});

		return () => {
			suspendedTexture.then((texture) => {
				texture.dispose();
			});
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			const options = $.derived(() => ground() === true ? {} : ground());
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => [
							texture(),
							$.get(options).height ?? 1,
							$.get(options).radius ?? 1,
							$.get(options).resolution ?? 128
						]);

						T($$anchor, {
							get is() {
								return GroundedSkybox;
							},

							get args() {
								return $.get($0);
							},

							get ref() {
								return skybox();
							},

							set ref($$value) {
								skybox($$value);
							}
						});
					}
				};

				$.if(node_1, ($$render) => {
					if (texture()) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (ground()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}