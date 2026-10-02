import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LumaSplatsThree } from '@lumaai/luma-web';
import { T, asyncWritable, useCache, useTask, useThrelte } from '@threlte/core';
import { useSuspense } from '@threlte/extras';
import { CubeEnvironment } from '@threlte/extras';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'source',
	'mode',
	'loadingAnimationEnabled',
	'particleRevealEnabled',
	'enableThreeShaderIntegration',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function LumaSplatsThree_1($$anchor, $$props) {
	$.push($$props, true);

	const $splats = () => $.store_get(splats, '$splats', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let mode = $.prop($$props, 'mode', 3, 'object'),
		loadingAnimationEnabled = $.prop($$props, 'loadingAnimationEnabled', 3, false),
		particleRevealEnabled = $.prop($$props, 'particleRevealEnabled', 3, false),
		enableThreeShaderIntegration = $.prop($$props, 'enableThreeShaderIntegration', 3, true),
		rest = $.rest_props($$props, rest_excludes);

	const { renderer, scene } = useThrelte();
	const { remember } = useCache();
	const suspend = useSuspense();
	const captureCubemap = mode() === 'env' || mode() === 'object-env';

	const splats = suspend(asyncWritable(remember(
		() => {
			return new Promise((resolve) => {
				const splats = new LumaSplatsThree({
					source: $$props.source,
					loadingAnimationEnabled: loadingAnimationEnabled(),
					particleRevealEnabled: particleRevealEnabled(),
					enableThreeShaderIntegration: enableThreeShaderIntegration()
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
		[$$props.source]
	)));

	let preheat = particleRevealEnabled() && loadingAnimationEnabled() ? 400 : loadingAnimationEnabled() ? 100 : 10;
	let frame = 0;
	let running = $.state(false);

	useTask(
		() => {
			frame++;

			if (frame >= preheat) {
				$.set(running, false);
				frame = 0;
			}
		},
		{ running: () => $.get(running) }
	);

	scene.backgroundBlurriness = 0.5;

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			T($$anchor, $.spread_props(
				{
					get is() {
						return $splats()[0];
					},

					oncreate: () => {
						$.set(running, true);
					}
				},
				() => rest,
				{
					dispose: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: $splats()[0] }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		};

		$.if(node, ($$render) => {
			if ((mode() === 'object' || mode() === 'object-env') && $splats()?.[0]) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			CubeEnvironment($$anchor, {
				get texture() {
					return $splats()[1];
				}
			});
		};

		$.if(node_2, ($$render) => {
			if ($splats()?.[1]) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}