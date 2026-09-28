import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Collider, AutoColliders } from '@threlte/rapier';

export default function Goal($$renderer, $$props) {
	let { ongoal, position, rotation } = $$props;

	if (T.Group) {
		$$renderer.push('<!--[-->');

		T.Group($$renderer, {
			position,
			rotation,
			children: ($$renderer) => {
				if (T.Group) {
					$$renderer.push('<!--[-->');

					T.Group($$renderer, {
						'position.y': 0.1,
						children: ($$renderer) => {
							Collider($$renderer, {
								shape: 'cuboid',
								args: [0.4, 0.5, 0.4],
								sensor: true,
								onsensorenter: ongoal
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

				AutoColliders($$renderer, {
					children: ($$renderer) => {
						if (T.Mesh) {
							$$renderer.push('<!--[-->');

							T.Mesh($$renderer, {
								children: ($$renderer) => {
									if (T.BoxGeometry) {
										$$renderer.push('<!--[-->');
										T.BoxGeometry($$renderer, { args: [1, 1, 1] });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (T.MeshStandardMaterial) {
										$$renderer.push('<!--[-->');
										T.MeshStandardMaterial($$renderer, { color: 'green' });
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}