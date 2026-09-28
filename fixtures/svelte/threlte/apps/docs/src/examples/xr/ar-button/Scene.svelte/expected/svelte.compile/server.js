import * as $ from 'svelte/internal/server';
import { T, useTask } from '@threlte/core';
import { VirtualEnvironment } from '@threlte/extras';
import { XR, Controller, Hand, pointerControls } from '@threlte/xr';
import { Vector3 } from 'three';
import Spaceship from './models/spaceship.svelte';
import Stars from './Stars.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		pointerControls('left');
		pointerControls('right');

		const scale = 0.02;

		// Toy hovering at eye level, ~30 cm ahead of the user.
		const home = new Vector3(0, 1.4, -0.3);

		let intersectionPoint;
		let translAccelleration = 0;
		let angleAccelleration = 0;
		let spaceShipRef = void 0;
		let translY = 0;
		let angleZ = 0;
		const up = new Vector3(0, 1, 0);
		const dir = new Vector3();
		const pivot = new Vector3();

		useTask(() => {
			if (intersectionPoint === undefined) return;

			const targetY = intersectionPoint.y - home.y;

			translAccelleration += (targetY - translY) * 0.01;
			translAccelleration *= 0.92;
			translY += translAccelleration;
			pivot.set(home.x, home.y + translY, home.z);
			dir.copy(intersectionPoint).sub(pivot).normalize();

			const dirCos = dir.dot(up);
			const angle = Math.acos(dirCos) - Math.PI * 0.5;

			angleAccelleration += (angle - angleZ) * 0.02;
			angleAccelleration *= 0.9;
			angleZ += angleAccelleration;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			XR($$renderer, {});
			$$renderer.push(`<!----> `);
			Controller($$renderer, { left: true });
			$$renderer.push(`<!----> `);
			Controller($$renderer, { right: true });
			$$renderer.push(`<!----> `);
			Hand($$renderer, { left: true });
			$$renderer.push(`<!----> `);
			Hand($$renderer, { right: true });
			$$renderer.push(`<!----> `);

			if (T.PerspectiveCamera) {
				$$renderer.push('<!--[-->');

				T.PerspectiveCamera($$renderer, {
					makeDefault: true,
					position: [0, 1.5, 0.3],
					fov: 50,
					oncreate: (ref) => {
						ref.lookAt(home);
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

				T.DirectionalLight($$renderer, {
					intensity: 1.8,
					position: [0, 2, 0.5],
					castShadow: true,
					'shadow.bias': -0.0001
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					'position.x': home.x,
					'position.y': home.y,
					'position.z': home.z,
					visible: false,
					onpointermove: (event) => {
						intersectionPoint = event.point;
					},

					children: ($$renderer) => {
						if (T.PlaneGeometry) {
							$$renderer.push('<!--[-->');
							T.PlaneGeometry($$renderer, { args: [2, 2] });
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

			Spaceship($$renderer, {
				scale,
				position: [home.x, home.y + translY, home.z],
				rotation: [angleZ, 0, angleZ, 'ZXY'],
				get ref() {
					return spaceShipRef;
				},

				set ref($$value) {
					spaceShipRef = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			VirtualEnvironment($$renderer, {
				visible: true,
				children: ($$renderer) => {
					Stars($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}