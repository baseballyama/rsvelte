import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Edges, useGltf } from '@threlte/extras';
import { AutoColliders } from '@threlte/rapier';
import { MathUtils } from 'three';

import {
	arenaHeight,
	arenaWidth,
	playerHeight,
	playerSpeed,
	playerWidth
} from '../config';

import { useArcadeControls } from '../controls.svelte';
import { game } from '../Game.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Player($$anchor, $$props) {
	$.push($$props, true);

	const $gltf = () => $.store_get(gltf, '$gltf', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const controls = useArcadeControls();
	let positionZ = $.derived(() => arenaHeight / 2 - playerHeight);
	let positionX = $.state(0);

	// 0.12 is a magic number that makes the player barely touch the border
	let posXMax = arenaWidth / 2 - playerWidth / 2 - 0.12;

	let playerCanMove = $.derived(() => game.state === 'playing' || game.state === 'await-ball-spawn' || game.state === 'level-loading');
	let centerPlayer = $.derived(() => game.state === 'menu' || game.state === 'level-loading');

	useTask((delta) => {
		if (!$.get(playerCanMove)) {
			if ($.get(centerPlayer)) {
				$.set(positionX, 0);
			}

			return;
		}

		// Analog-friendly: actions have strength 0–1 so a stick tilt scales speed.
		const direction = controls.axis('left', 'right');

		if (direction === 0) return;

		$.set(positionX, Math.min(Math.max($.get(positionX) + direction * playerSpeed * delta * 30, -posXMax), posXMax), true);
	});

	$.user_effect(() => {
		game.playerPosition = $.get(positionX);
	});

	const gltf = useGltf('/models/ball-game/player/player-simple.glb');
	let colliders = $.state($.proxy([]));

	useTask(() => {
		if ($.get(colliders).length) {
			const collider = $.get(colliders)[0];

			collider.setTranslation({ x: $.get(positionX), y: 0, z: $.get(positionZ) });
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.Group, ($$anchor, T_Group) => {
				T_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						AutoColliders($$anchor, {
							shape: 'convexHull',
							get colliders() {
								return $.get(colliders);
							},

							set colliders($$value) {
								$.set(colliders, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => MathUtils.DEG2RAD * -90);
									let $1 = $.derived(() => MathUtils.DEG2RAD * 90);

									$.component(node_2, () => T.Mesh, ($$anchor, T_Mesh) => {
										T_Mesh($$anchor, {
											get 'position.z'() {
												return $.get(positionZ);
											},

											get 'position.x'() {
												return $.get(positionX);
											},

											get 'rotation.x'() {
												return $.get($0);
											},

											get 'rotation.y'() {
												return $.get($1);
											},
											'scale.x': 0.5,
											'scale.y': 0.3,
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = root();
												var node_3 = $.first_child(fragment_4);

												T(node_3, {
													get is() {
														return $gltf().nodes.Player.geometry;
													}
												});

												var node_4 = $.sibling(node_3, 2);

												$.component(node_4, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
													T_MeshStandardMaterial($$anchor, { color: 'blue' });
												});

												var node_5 = $.sibling(node_4, 2);

												Edges(node_5, {
													scale: [1, 1.1, 1.1],
													thresholdAngle: 10,
													get color() {
														return game.baseColor;
													}
												});

												$.append($$anchor, fragment_4);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($gltf()?.nodes.Player) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}