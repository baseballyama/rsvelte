import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useThrelte } from '@threlte/core';
import { useGltf, useTexture } from '@threlte/extras';
import { SheetObject } from '@threlte/theatre';
import { EquirectangularReflectionMapping, SRGBColorSpace } from 'three';
import Scene from './Scene.svelte';
import ScrollSheet from './ScrollSheet.svelte';
import { cubeGeometry } from './state';

var root = $.from_html(`<!> <!>`, 1);

export default function App($$anchor, $$props) {
	$.push($$props, true);

	const $cubeGeometry = () => $.store_get(cubeGeometry, '$cubeGeometry', $$stores);
	const $env = () => $.store_get(env, '$env', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { scene } = useThrelte();
	const cube = useGltf('/cube.glb');

	const env = useTexture('/oil-on-water.png', {
		transform(texture) {
			texture.mapping = EquirectangularReflectionMapping;
			texture.colorSpace = SRGBColorSpace;
		}
	});

	cube.then((gltf) => {
		cubeGeometry.set(gltf.nodes.Cube.geometry);
	});

	env.then((texture) => {
		scene.environment = texture;
		scene.environmentIntensity = 10;
	});

	var fragment = root();
	var node = $.first_child(fragment);

	ScrollSheet(node, {
		name: 'Environment',
		startAtScrollPosition: 0,
		endAtScrollPosition: 5,
		useSpring: true,
		children: ($$anchor, $$slotProps) => {
			SheetObject($$anchor, {
				key: 'Settings',
				props: { rotation: { x: 0, y: 0, z: 0 } },
				onchange: (values) => {
					scene.environmentRotation.x = values.rotation.x;
					scene.environmentRotation.y = values.rotation.y;
					scene.environmentRotation.z = values.rotation.z;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Scene($$anchor, {});
		};

		$.if(node_1, ($$render) => {
			if ($cubeGeometry() && $env()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}