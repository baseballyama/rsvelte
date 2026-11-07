import * as $ from 'svelte/internal/server';
import { OrbitControls } from '@threlte/extras';
import { T } from '@threlte/core';
import { interactivity, meshBounds } from '@threlte/extras';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { showBounds = false } = $$props;

		interactivity();

		const positions = [[0, 1, 0], [1, -1, 0], [-1, -1, 0]];

		class BoundsItem {
			wireframe = true;
			position;

			constructor(position) {
				this.position = position;
			}
		}

		const boundsItems = positions.map((position) => {
			return new BoundsItem(position);
		});

		const size = 1;

		// half of the box's diagonal === radius of the bounding sphere
		const radius = 0.5 * size * Math.sqrt(3);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');

			T.PerspectiveCamera($$renderer, {
				makeDefault: true,
				'position.z': 5,
				children: ($$renderer) => {
					OrbitControls($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` <!--[-->`);

		const each_array = $.ensure_array_like(boundsItems);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let boundsItem = each_array[$$index];

			if (T.Mesh) {
				$$renderer.push('<!--[-->');

				T.Mesh($$renderer, {
					raycast: meshBounds,
					onpointerenter: () => {
						boundsItem.wireframe = false;
					},

					onpointerleave: () => {
						boundsItem.wireframe = true;
					},
					position: boundsItem.position,
					children: ($$renderer) => {
						if (T.BoxGeometry) {
							$$renderer.push('<!--[-->');
							T.BoxGeometry($$renderer, { args: [size, size, size] });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (T.MeshStandardMaterial) {
							$$renderer.push('<!--[-->');
							T.MeshStandardMaterial($$renderer, { color: 'hotpink', wireframe: boundsItem.wireframe });
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

		if (T.Group) {
			$$renderer.push('<!--[-->');

			T.Group($$renderer, {
				visible: showBounds,
				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array_1 = $.ensure_array_like(positions);

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let position = each_array_1[$$index_1];

						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								position,
								children: ($$renderer) => {
									if (T.SphereGeometry) {
										$$renderer.push('<!--[-->');
										T.SphereGeometry($$renderer, { args: [radius] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { transparent: true, opacity: 0.25 });
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