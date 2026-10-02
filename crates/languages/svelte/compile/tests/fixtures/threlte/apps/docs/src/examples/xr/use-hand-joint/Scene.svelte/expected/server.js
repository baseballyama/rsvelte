import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Hand, XR, useXR } from '@threlte/xr';
import { Text } from '@threlte/extras';
import { Attractor, Debug } from '@threlte/rapier';
import JointCollider from './JointBody.svelte';
import Cubes from './Cube.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { isHandTracking } = useXR();
		let debug = false;

		if (debug) {
			$$renderer.push('<!--[0-->');
			Debug($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		XR($$renderer, {
			children: ($$renderer) => {
				Hand($$renderer, { left: true, onpinchend: () => debug = !debug });
				$$renderer.push(`<!----> `);
				Hand($$renderer, { right: true, onpinchend: () => debug = !debug });
				$$renderer.push(`<!----> `);

				if ($.store_get($$store_subs ??= {}, '$isHandTracking', isHandTracking)) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array = $.ensure_array_like({ length: 25 });

					for (let jointIndex = 0, $$length = each_array.length; jointIndex < $$length; jointIndex++) {
						let _ = each_array[jointIndex];

						JointCollider($$renderer, { jointIndex, hand: 'left' });
						$$renderer.push(`<!----> `);
						JointCollider($$renderer, { jointIndex, hand: 'right' });
						$$renderer.push(`<!---->`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				Text($$renderer, {
					position: [0, 1.7, -1],
					text: 'Pinch to toggle physics debug.'
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);
		Cubes($$renderer, {});
		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [0, 1, 1],
				oncreate: (ref) => ref.lookAt(0, 1.8, 0)
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

		if (T.SpotLight) {
			$$renderer.push('<!--[-->');

			T.SpotLight($$renderer, {
				position: [1, 8, 1],
				angle: 0.3,
				penumbra: 1,
				intensity: 30,
				castShadow: true,
				'target.x': 0,
				'target.y': 1.8,
				'target.z': 0
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);
		Attractor($$renderer, { range: 50, strength: 0.000001, position: [0, 1.7, 0] });
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}