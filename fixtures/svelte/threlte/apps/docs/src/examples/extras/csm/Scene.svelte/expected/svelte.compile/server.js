import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { OrbitControls } from '@threlte/extras';
import { DoubleSide, MathUtils } from 'three';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [45, 40, -45],
				fov: 90,
				children: ($$renderer) => {
					OrbitControls($$renderer, { autoRotate: true, autoRotateSpeed: 0.1, 'target.y': -10 });
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
			T.AmbientLight($$renderer, { intensity: 1 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'rotation.x': MathUtils.DEG2RAD * -90,
				castShadow: true,
				receiveShadow: true,
				children: ($$renderer) => {
					if (T.PlaneGeometry) {
						$$renderer.push('<!--[-->');
						T.PlaneGeometry($$renderer, { args: [1000, 1000] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshStandardMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshStandardMaterial($$renderer, { color: '#fa992a' });
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

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				children: ($$renderer) => {
					if (T.SphereGeometry) {
						$$renderer.push('<!--[-->');
						T.SphereGeometry($$renderer, { args: [400] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, { color: '#0057fa', side: DoubleSide });
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

		$$renderer.push(` <!--[-->`);

		const each_array = $.ensure_array_like({ length: 120 });

		for (let x = 0, $$length = each_array.length; x < $$length; x++) {
			let _ = each_array[x];
			const distance = Math.abs(Math.sin(x)) * 50 + 10;
			const height = Math.abs((30 - distance) / 2);
			const posX = distance * Math.cos(MathUtils.DEG2RAD * (360 / 120 * x));
			const posY = distance * Math.sin(MathUtils.DEG2RAD * (360 / 120 * x));

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					castShadow: true,
					receiveShadow: true,
					'position.x': posX,
					'position.y': height / 2,
					'position.z': posY,
					children: ($$renderer) => {
						if (T.CapsuleGeometry) {
							$$renderer.push('<!--[-->');
							T.CapsuleGeometry($$renderer, { args: [3, height, 12, 32] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: '#45c1ff' });
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
		}

		$$renderer.push(`<!--]-->`);
	});
}