import * as $ from 'svelte/internal/server';
import { Vector2 } from 'three';
import { T } from '@threlte/core';
import { Edges } from '@threlte/extras';

export default function Mountains($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const positions = Array(35).keys().map((index) => {
			const size = Math.random() * 20 + 4;

			return {
				size,
				position: new Vector2(Math.cos(index), Math.sin(index)).subScalar(0.5).normalize().multiplyScalar(100)
			};
		});

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'rotation.x': -Math.PI / 2,
				'position.y': -0.1,
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

					if (T.MeshBasicMaterial) {
						$$renderer.push('<!--[-->');
						T.MeshBasicMaterial($$renderer, { color: 'rgb(14, 22, 37)' });
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

		const each_array = $.ensure_array_like(positions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { position, size } = each_array[$$index];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [position.x, size / 2 - 1, position.y],
					oncreate: (ref) => ref.lookAt(0, size / 2, 0),
					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								'rotation.z': Math.PI / 2,
								children: ($$renderer) => {
									if (T.CircleGeometry) {
										$$renderer.push('<!--[-->');
										T.CircleGeometry($$renderer, { args: [size, 3] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);
									Edges($$renderer, {});
									$$renderer.push(`<!----> `);

									if (T.MeshBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshBasicMaterial($$renderer, { color: 'rgb(14, 22, 37)' });
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