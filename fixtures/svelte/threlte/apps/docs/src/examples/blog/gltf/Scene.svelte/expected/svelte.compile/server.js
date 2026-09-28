import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { OrbitControls, useDraco, useGltf, useTexture } from '@threlte/extras';
import { NoToneMapping } from 'three';
import Mesh from './Mesh.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { settings } = $$props;
		const dracoLoader = useDraco();
		const gltf = useGltf('https://infinite-turtles.pages.dev/models/cards-transformed.glb', { dracoLoader });
		const texture = useTexture('https://infinite-turtles.pages.dev/images/map.png');
		const { renderer } = useThrelte();

		renderer.toneMapping = NoToneMapping;

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [3, 0, 3],
				fov: 25,
				children: ($$renderer) => {
					OrbitControls($$renderer, { autoRotate: true, enableDamping: true });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		$.await($$renderer, gltf, () => {}, (gltf) => {
			$.await($$renderer, texture, () => {}, (texture) => {
				Mesh($$renderer, {
					geometry: gltf.nodes.Background.geometry,
					texture,
					visible: settings.background,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.Border.geometry,
					texture,
					visible: settings.border,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.Turtle.geometry,
					texture,
					visible: settings.turtle,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.Player.geometry,
					texture,
					visible: settings.player,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.EnemyScorp.geometry,
					texture,
					visible: settings.enemy,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.Heart.geometry,
					texture,
					visible: settings.heart,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.Potion.geometry,
					texture,
					visible: settings.potion,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.RuneEffect.geometry,
					texture,
					visible: settings.runeEffect,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!----> `);

				Mesh($$renderer, {
					geometry: gltf.nodes.RuneHost.geometry,
					texture,
					visible: settings.runeHost,
					wireframe: settings.wireframe
				});

				$$renderer.push(`<!---->`);
			});

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]-->`);
	});
}