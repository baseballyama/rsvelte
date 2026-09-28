import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { useGltf } from '../../hooks/useGltf.js';
import { useSuspense } from '../../suspense/useSuspense.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'url',
	'dracoLoader',
	'meshoptDecoder',
	'ktx2Loader',
	'gltf',
	'scene',
	'animations',
	'asset',
	'cameras',
	'scenes',
	'userData',
	'parser',
	'materials',
	'nodes',
	'onload',
	'onunload',
	'onerror',
	'children'
]);

export default function GLTF($$anchor, $$props) {
	$.push($$props, true);

	let gltf = $.prop($$props, 'gltf', 15),
		scene = $.prop($$props, 'scene', 15),
		animations = $.prop($$props, 'animations', 15),
		asset = $.prop($$props, 'asset', 15),
		cameras = $.prop($$props, 'cameras', 15),
		scenes = $.prop($$props, 'scenes', 15),
		userData = $.prop($$props, 'userData', 15),
		parser = $.prop($$props, 'parser', 15),
		materials = $.prop($$props, 'materials', 15),
		nodes = $.prop($$props, 'nodes', 15),
		props = $.rest_props($$props, rest_excludes);

	const loader = useGltf({
		dracoLoader: $$props.dracoLoader,
		meshoptDecoder: $$props.meshoptDecoder,
		ktx2Loader: $$props.ktx2Loader
	});

	const onLoad = (data) => {
		if (gltf()) $$props.onunload?.();

		gltf(data);
		scene(data.scene);
		animations(data.animations);
		asset(data.asset);
		cameras(data.cameras);
		scenes(data.scenes);
		userData(data.userData);
		parser(data.parser);
		materials(data.materials);
		nodes(data.nodes);
		$$props.onload?.(gltf());
	};

	const onError = (error) => {
		gltf(undefined);
		scene(undefined);
		animations(undefined);
		asset(undefined);
		cameras(undefined);
		scenes(undefined);
		userData(undefined);
		parser(undefined);
		nodes(undefined);
		materials(undefined);
		$$props.onerror?.(error);
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

	$.user_pre_effect(() => {
		loadGltf($$props.url);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			T($$anchor, $.spread_props(
				{
					get is() {
						return scene();
					}
				},
				() => props,
				{
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.snippet(node_1, () => $$props.children ?? $.noop, () => ({ ref: scene() }));
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}
			));
		};

		$.if(node, ($$render) => {
			if (scene()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}