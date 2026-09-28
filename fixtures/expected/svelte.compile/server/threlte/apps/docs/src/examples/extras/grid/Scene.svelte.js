import * as $ from 'svelte/internal/server';
import { BoxGeometry, Vector2 } from 'three';
import { Gizmo, OrbitControls } from '@threlte/extras';
import { T } from '@threlte/core';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const positions = [];
		const count = 4;

		for (let j = 0; j < count; j += 1) {
			for (let i = 0; i < count; i += 1) {
				positions.push(new Vector2(i, j).multiplyScalar(2).subScalar(3));
			}
		}

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				position: 15,
				fov: 60,
				children: ($$renderer) => {
					OrbitControls($$renderer, {
						children: ($$renderer) => {
							Gizmo($$renderer, {});
						},
						$$slots: { default: true }
					});
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
			let { x, y } = each_array[$$index];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: [x, 0.5, y],
					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshBasicMaterial($$renderer, { color: 'white', opacity: 0.9, transparent: true });
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

						if (T.LineSegments) {
							$$renderer.push('<!--[-->');

							T.LineSegments($$renderer, {
								children: ($$renderer) => {
									if (T.EdgesGeometry) {
										$$renderer.push('<!--[-->');
										T.EdgesGeometry($$renderer, { args: [new BoxGeometry()] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.LineBasicMaterial) {
										$$renderer.push('<!--[-->');
										T.LineBasicMaterial($$renderer, { color: 'black', linewidth: 2 });
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