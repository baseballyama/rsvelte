import * as $ from 'svelte/internal/server';
import Spaceship from './Spaceship.svelte';
import { BakeShadows, OrbitControls, Suspense } from '@threlte/extras';
import { Color } from 'three';
import { T, useThrelte } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { size, scene } = useThrelte();

		scene.background = new Color('black');

		let zoom = $.derived(() => $.store_get($$store_subs ??= {}, '$size', size).width / 50);

		const ships = [
			{ name: 'Bob', position: [-12, 0, 3] },
			{ name: 'Challenger', position: [10, 5, 6] },
			{ name: 'Dispatcher', position: [8, 3, -23] },
			{ name: 'Executioner', position: [12, -4, 6] },
			{ name: 'Imperial', position: [-1, 0, -21] },
			{ name: 'Insurgent', position: [-13, 1, -21] },
			{ name: 'Omen', position: [-9, -5, 13] },
			{ name: 'Pancake', position: [-9, -3, -9] },
			{ name: 'Spitfire', position: [1, 0, 1] },
			{ name: 'Striker', position: [8, -1, -10] },
			{ name: 'Zenith', position: [-1, 0, 13] }
		];

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				position: [-40, 25, 40],
				makeDefault: true,
				zoom: zoom(),
				oncreate: (ref) => {
					ref.lookAt(0, 0, -8);
				},

				children: ($$renderer) => {
					OrbitControls($$renderer, { enableDamping: true, target: [0, 0, -8] });
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.SpotLight) {
			$$renderer.push('<!--[-->');

			T.SpotLight($$renderer, {
				position: [0, 25, 0],
				castShadow: true,
				'shadow.bias': -0.0001,
				'shadow.mapSize.width': 2 ** 11,
				'shadow.mapSize.height': 2 ** 11,
				intensity: 1000,
				angle: Math.PI / 3
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Suspense($$renderer, {
			final: true,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(ships);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let { name, position } = each_array[$$index];

					Spaceship($$renderer, { name, position });
				}

				$$renderer.push(`<!--]--> `);
				BakeShadows($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				receiveShadow: true,
				'position.y': -10,
				'rotation.x': -1 * 0.5 * Math.PI,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [100] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 'white' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}