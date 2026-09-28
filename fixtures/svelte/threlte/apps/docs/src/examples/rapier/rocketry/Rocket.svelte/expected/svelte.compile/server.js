import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { AutoColliders, RigidBody } from '@threlte/rapier';
import IsStatic from './IsStatic.svelte';
import Player from './Player.svelte';
import Thruster from './Thruster.svelte';

export default function Rocket($$renderer, $$props) {
	let { onsleep, checkIsStatic, children: componentChildren } = $$props;
	let currentSide = 'left';
	const getPlayer = (key) => players.find((p) => p.key === key);
	let players = [];

	{
		function children($$renderer, { rigidBody }) {
			componentChildren?.($$renderer);
			$$renderer.push(`<!----> `);

			if (checkIsStatic) {
				$$renderer.push('<!--[0-->');

				IsStatic($$renderer, {
					rigidBody,
					linearMax: 0.00001,
					angularMax: 0.00001,
					onstatic: onsleep
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array = $.ensure_array_like(players);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let player = each_array[$$index];

				{
					function children($$renderer, active) {
						Thruster($$renderer, { active });
					}

					Player($$renderer, {
						rigidBody,
						key: player.key,
						min: player.side === 'left' ? -0.5 : 0.25,
						max: player.side === 'left' ? -0.25 : 0.5,
						active: player.active,
						children,
						$$slots: { default: true }
					});
				}
			}

			$$renderer.push(`<!--]--> `);

			AutoColliders($$renderer, {
				children: ($$renderer) => {
					if (T.Mesh) {
						$$renderer.push('<!--[-->');

						T.Mesh($$renderer, {
							castShadow: true,
							receiveShadow: true,
							children: ($$renderer) => {
								if (T.MeshStandardMaterial) {
									$$renderer.push('<!--[-->');
									T.MeshStandardMaterial($$renderer, { color: 'red', transparent: true, opacity: 0.4 });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (T.BoxGeometry) {
									$$renderer.push('<!--[-->');
									T.BoxGeometry($$renderer, {});
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
		}

		RigidBody($$renderer, {
			canSleep: false,
			linearDamping: 0.4,
			angularDamping: 5,
			enabledRotations: [false, false, true],
			type: 'dynamic',
			children,
			$$slots: { default: true }
		});
	}
}