import * as $ from 'svelte/internal/server';
import { Mesh } from 'three';
import { T } from '@threlte/core';
import { XR, Hand, Controller } from '@threlte/xr';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const boxes = [];

		const handleEvent = (event) => {
			console.log('Hand', event);

			if (event.type === 'pinchend') {
				createBox(event);
			}
		};

		const handleControllerEvent = (event) => {
			console.log('Controller', event);
		};

		const createBox = (event) => {
			const controller = event.target;
			const indexTip = controller?.joints['index-finger-tip'];

			if (!indexTip) return;

			const box = new Mesh();

			box.position.copy(indexTip.position);
			box.quaternion.copy(indexTip.quaternion);
			boxes.push(box);
		};

		const hands = ['left', 'right'];

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
				fallback,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(hands);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let hand = each_array[$$index];

						Hand($$renderer, {
							hand,
							onconnected: handleEvent,
							ondisconnected: handleEvent,
							onpinchstart: handleEvent,
							onpinchend: handleEvent
						});

						$$renderer.push(`<!----> `);

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

						$$renderer.push(`<!---->`);
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