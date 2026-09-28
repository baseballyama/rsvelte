import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { interactivity } from '@threlte/extras';
import { Spring } from 'svelte/motion';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		interactivity();

		const scale = new Spring(1);
		let rotation = 0;

		useTask((delta) => {
			rotation += delta;
		});

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [10, 10, 10],
				oncreate: (ref) => {
					ref.lookAt(0, 1, 0);
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
			T.DirectionalLight($$renderer, { position: [3, 10, 7] });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'rotation.y': rotation,
				'position.y': 1,
				scale: $.store_get($$store_subs ??= {}, '$scale', scale),
				onpointerenter: () => scale.set(1.5),
				onpointerleave: () => scale.set(1),
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [1, 2, 1] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: 'hotpink' });
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