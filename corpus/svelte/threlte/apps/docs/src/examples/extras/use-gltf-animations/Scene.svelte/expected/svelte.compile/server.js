import * as $ from 'svelte/internal/server';

import {
	Environment,
	OrbitControls,
	useDraco,
	useGltf,
	useGltfAnimations
} from '@threlte/extras';

import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const dracoLoader = useDraco();
		const gltf = useGltf('/models/LittlestTokyo.glb', { dracoLoader });
		const { actions, mixer } = useGltfAnimations(() => $.store_get($$store_subs ??= {}, '$gltf', gltf));

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [600, 200, -600],
				near: 10,
				far: 10_000,
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						autoRotate: true,
						autoRotateSpeed: 0.2,
						enableDamping: true,
						enableZoom: false,
						target: [-60, -75, 0]
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/industrial_sunset_puresky_1k.hdr',
			isBackground: true
		});

		$$renderer.push(`<!----> `);

		$.await($$renderer, gltf, () => {}, ({ scene }) => {
			T($$renderer, { is: scene });
		});

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { actions, mixer });
	});
}