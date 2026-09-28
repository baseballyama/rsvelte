import * as $ from 'svelte/internal/server';
import { T, useThrelte } from '@threlte/core';
import { Suspense, Text } from '@threlte/extras';
import Spaceship from './Spaceship.svelte';
import StarsEmitter from './StarsEmitter.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { size } = useThrelte();
		let zoom = $.derived(() => $.store_get($$store_subs ??= {}, '$size', size).width / 50);

		if (T.OrthographicCamera) {
			$$renderer.push('<!--[-->');

			T.OrthographicCamera($$renderer, {
				position: [-40, 25, 40],
				makeDefault: true,
				zoom: zoom(),
				oncreate: (ref) => {
					ref.lookAt(0, 0, -8);
				}
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { position: [5, 10, 3], intensity: 2.5 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		{
			function fallback($$renderer) {
				Text($$renderer, {
					'position.z': -8,
					text: 'Loading...',
					fontSize: 1,
					color: 'white',
					anchorX: '50%',
					anchorY: '50%',
					oncreate: (ref) => {
						ref.lookAt(-40, 25, 40);
					}
				});
			}

			function error($$renderer, { errors }) {
				Text($$renderer, {
					'position.z': -8,
					text: errors.map((e) => e).join(', '),
					fontSize: 1,
					color: 'white',
					anchorX: '50%',
					anchorY: '50%',
					oncreate: (ref) => {
						ref.lookAt(-40, 25, 40);
					}
				});
			}

			Suspense($$renderer, {
				final: true,
				fallback,
				error,
				children: ($$renderer) => {
					StarsEmitter($$renderer, {});
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Bob', position: [-12, 0, 3] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Challenger', position: [10, 5, 6] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Dispatcher', position: [8, 3, -23] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Executioner', position: [12, -4, 6] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Imperial', position: [-1, 0, -21] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Insurgent', position: [-13, 1, -21] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Omen', position: [-9, -5, 13] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Pancake', position: [-9, -3, -9] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Spitfire', position: [1, 0, 1] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Striker', position: [8, -1, -10] });
					$$renderer.push(`<!----> `);
					Spaceship($$renderer, { name: 'Zenith', position: [-1, 0, 13] });
					$$renderer.push(`<!---->`);
				},
				$$slots: { fallback: true, error: true, default: true }
			});
		}

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}