import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { AutoColliders } from '@threlte/rapier';
import Goal from './Goal.svelte';
import Rocket from './Rocket.svelte';
import Start from './Start.svelte';
import FollowCamera from './FollowCamera.svelte';

export default function Level($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { level, levelcomplete } = $$props;
		let goalReached = false;
		let rocketSleeping = false;

		Start($$renderer, {
			position: level.start.position,
			rotation: level.start.rotation,
			children: ($$renderer) => {
				{
					function children($$renderer) {
						FollowCamera($$renderer, {});
					}

					Rocket($$renderer, {
						checkIsStatic: goalReached,
						onsleep: () => rocketSleeping = true,
						children,
						$$slots: { default: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Goal($$renderer, {
			position: level.goal.position,
			rotation: level.goal.rotation,
			ongoal: () => {
				goalReached = true;
			}
		});

		$$renderer.push(`<!----> <!--[-->`);

		const each_array = $.ensure_array_like(level.blocks);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let block = each_array[$$index];

			if (T.Group) {
				$$renderer.push('<!--[-->');

				T.Group($$renderer, {
					position: block.position,
					rotation: block.rotation,
					children: ($$renderer) => {
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
												T.MeshStandardMaterial($$renderer, { color: 'blue', transparent: true, opacity: 0.4 });
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

			T.DirectionalLight($$renderer, {
				position: [4, 10, 0],
				castShadow: true,
				'shadow.mapSize': 1024,
				'shadow.camera.left': -10,
				'shadow.camera.right': 10,
				'shadow.camera.top': 10,
				'shadow.camera.bottom': -10
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}