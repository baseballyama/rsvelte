import * as $ from 'svelte/internal/server';
import { Mesh } from 'three';
import { T, useTask, useThrelte } from '@threlte/core';
import { OrbitControls, useViewport, RoundedBoxGeometry } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const viewport = useViewport();
		const { renderStage, scheduler } = useThrelte();
		let mesh = new Mesh();

		const positions = [
			[1, 0.5, 3.5],
			[-1, 0.5, -3.5],
			[-1, 0.5, 3.5],
			[1, 0.5, -3.5]
		];

		useTask(
			() => {
				const { width, height, distance } = viewport.current;

				mesh.scale.set(width * 0.4, height * 0.2, distance * 0.25);
				mesh.position.y = mesh.scale.y / 2;
			},
			{
				stage: scheduler.createStage(Symbol('viewport-stage'), { before: renderStage })
			}
		);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: [8, 8, 8],
				fov: 50,
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						minDistance: 5,
						maxDistance: 15,
						enableDamping: true,
						autoRotate: true
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.DirectionalLight) {
			$$renderer.push('<!--[-->');
			T.DirectionalLight($$renderer, { castShadow: true, position: [3, 5, 3], intensity: 1.5 });
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

		T($$renderer, {
			is: mesh,
			castShadow: true,
			receiveShadow: true,
			children: ($$renderer) => {
				RoundedBoxGeometry($$renderer, { radius: 0.1 });
				$$renderer.push(`<!----> `);

				if (T.MeshStandardMaterial) {
					$$renderer.push('<!--[-->');
					T.MeshStandardMaterial($$renderer, { color: 'turquoise' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(positions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let position = each_array[$$index];

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					castShadow: true,
					position,
					children: ($$renderer) => {
						if (T.DodecahedronGeometry) {
							$$renderer.push('<!--[-->');
							T.DodecahedronGeometry($$renderer, { args: [0.5] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshToonMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshToonMaterial($$renderer, { color: '#fff' });
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

		$$renderer.push(`<!--]--> `);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'rotation.x': -Math.PI / 2,
				scale: 6,
				receiveShadow: true,
				children: ($$renderer) => {
					if (T.CircleGeometry) {
						$$renderer.push('<!--[-->');
						T.CircleGeometry($$renderer, { args: [1, 128] });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (T.MeshToonMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshToonMaterial($$renderer, { color: '#ccc' });
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
	});
}