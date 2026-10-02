import * as $ from 'svelte/internal/server';
import { useThrelte } from '@threlte/core';
import { useGltf, useTexture } from '@threlte/extras';
import { SheetObject } from '@threlte/theatre';
import { EquirectangularReflectionMapping, SRGBColorSpace } from 'three';
import Scene from './Scene.svelte';
import ScrollSheet from './ScrollSheet.svelte';
import { cubeGeometry } from './state';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
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

		ScrollSheet($$renderer, {
			name: 'Environment',
			startAtScrollPosition: 0,
			endAtScrollPosition: 5,
			useSpring: true,
			children: ($$renderer) => {
				SheetObject($$renderer, {
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

		$$renderer.push(`<!----> `);

		if ($.store_get($$store_subs ??= {}, '$cubeGeometry', cubeGeometry) && $.store_get($$store_subs ??= {}, '$env', env)) {
			$$renderer.push('<!--[0-->');
			Scene($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}