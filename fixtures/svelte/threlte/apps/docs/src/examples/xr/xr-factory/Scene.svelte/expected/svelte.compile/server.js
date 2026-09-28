import * as $ from 'svelte/internal/server';
import { Mesh, PerspectiveCamera } from 'three';
import { T, useThrelte } from '@threlte/core';
import { XR, Controller } from '@threlte/xr';
import { setupHands } from './setupHands';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { renderer } = useThrelte();
		const boxes = [];

		const handleControllerEvent = (event) => {
			console.log('Controller', event);
		};

		const hands = ['left', 'right'];
		const { leftHand, rightHand, handFactory } = setupHands(renderer);

		{
			function fallback($$renderer) {
				if (T.PerspectiveCamera) {
					$$renderer.push('<!--[-->');

					T.PerspectiveCamera($$renderer, {
						makeDefault: true,
						position: [0, 1.8, 1],
						oncreate: (ref) => ref.lookAt(0, 1.8, 0)
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			XR($$renderer, {
				handFactory,
				fallback,
				children: ($$renderer) => {
					T($$renderer, { is: leftHand });
					$$renderer.push(`<!----> `);
					T($$renderer, { is: rightHand });
					$$renderer.push(`<!----> <!--[-->`);

					const each_array = $.ensure_array_like(hands);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let hand = each_array[$$index];

						Controller($$renderer, {
							hand,
							onconnected: handleControllerEvent,
							ondisconnected: handleControllerEvent,
							onselect: handleControllerEvent,
							onsqueeze: handleControllerEvent,
							onselectstart: handleControllerEvent,
							onselectend: handleControllerEvent,
							onsqueezestart: handleControllerEvent,
							onsqueezeend: handleControllerEvent
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { fallback: true, default: true }
			});
		}

		$$renderer.push(`<!----> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				rotation: [-Math.PI / 2, 0, 0],
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [1] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, {});
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

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <!--[-->`);

		const each_array_1 = $.ensure_array_like(boxes);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let box = each_array_1[$$index_1];

			T($$renderer, {
				is: box,
				children: ($$renderer) => {
					if (T.BoxGeometry) {
						$$renderer.push('<!--[-->');
						T.BoxGeometry($$renderer, { args: [0.05, 0.05, 0.05] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: Math.random() * 0xffffff });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}