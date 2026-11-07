import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Environment,
	OrbitControls,
	useDraco,
	useGltf,
	useGltfAnimations
} from '@threlte/extras';

import { T } from '@threlte/core';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const dracoLoader = useDraco();
	const gltf = useGltf('/models/LittlestTokyo.glb', { dracoLoader });
	const { actions, mixer } = useGltfAnimations(() => $gltf());
	var $$exports = { actions, mixer };
	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, {
			makeDefault: true,
			position: [600, 200, -600],
			near: 10,
			far: 10_000,
			children: ($$anchor, $$slotProps) => {
				OrbitControls($$anchor, {
					autoRotate: true,
					autoRotateSpeed: 0.2,
					enableDamping: true,
					enableZoom: false,
					target: [-60, -75, 0]
				});
			},
			$$slots: { default: true }
		});
	});

	var node_1 = $.sibling(node, 2);

	Environment(node_1, {
		url: '/textures/equirectangular/hdr/industrial_sunset_puresky_1k.hdr',
		isBackground: true
	});

	var node_2 = $.sibling(node_1, 2);

	$.await(node_2, () => gltf, null, ($$anchor, $$source) => {
		var $$value = $.derived(() => {
			var { scene } = $.get($$source);

			return { scene };
		});

		var scene = $.derived(() => $.get($$value).scene);

		T($$anchor, {
			get is() {
				return $.get(scene);
			}
		});
	});

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}