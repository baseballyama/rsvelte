import * as $ from 'svelte/internal/server';
import { LumaSplatsThree } from '@lumaai/luma-web';
import { T, asyncWritable, useCache, useTask, useThrelte } from '@threlte/core';
import { useSuspense } from '@threlte/extras';
import { CubeEnvironment } from '@threlte/extras';

export default function LumaSplatsThree_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			source,
			mode = 'object',
			loadingAnimationEnabled = false,
			particleRevealEnabled = false,
			enableThreeShaderIntegration = true,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const { renderer, scene } = useThrelte();
		const { remember } = useCache();
		const suspend = useSuspense();
		const captureCubemap = mode === 'env' || mode === 'object-env';

		const splats = suspend(asyncWritable(remember(
			() => {
				return new Promise((resolve) => {
					const splats = new LumaSplatsThree({
						source,
						loadingAnimationEnabled,
						particleRevealEnabled,
						enableThreeShaderIntegration
					});

					splats.onLoad = async () => {
						if (captureCubemap) {
							splats.captureCubemap(renderer).then((cubemap) => {
								resolve([splats, cubemap]);
							});
						} else {
							resolve([splats, undefined]);
						}
					};
				});
			},
			[source]
		)));

		let preheat = particleRevealEnabled && loadingAnimationEnabled ? 400 : loadingAnimationEnabled ? 100 : 10;
		let frame = 0;
		let running = false;

		useTask(
			() => {
				frame++;

				if (frame >= preheat) {
					running = false;
					frame = 0;
				}
			},
			{ running: () => running }
		);

		scene.backgroundBlurriness = 0.5;

		if ((mode === 'object' || mode === 'object-env') && $.store_get($$store_subs ??= {}, '$splats', splats)?.[0]) {
			$$renderer.push('<!--[0-->');

			T($$renderer, $.spread_props([
				{
					is: $.store_get($$store_subs ??= {}, '$splats', splats)[0],
					oncreate: () => {
						running = true;
					}
				},
				rest,
				{
					dispose: false,
					children: ($$renderer) => {
						children?.($$renderer, { ref: $.store_get($$store_subs ??= {}, '$splats', splats)[0] });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if ($.store_get($$store_subs ??= {}, '$splats', splats)?.[1]) {
			$$renderer.push('<!--[0-->');

			CubeEnvironment($$renderer, {
				texture: $.store_get($$store_subs ??= {}, '$splats', splats)[1]
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}