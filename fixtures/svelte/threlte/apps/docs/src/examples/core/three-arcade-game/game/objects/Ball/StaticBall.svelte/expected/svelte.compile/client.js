import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { arenaHeight, playerHeight, playerToBorderDistance } from '../../config';
import { game } from '../../Game.svelte';
import { ballGeometry, ballMaterial } from './common';

var root = $.from_html(`<!> <!>`, 1);

export default function StaticBall($$anchor, $$props) {
	$.push($$props, true);

	const startAtPosZ = arenaHeight / 2 - playerHeight - playerToBorderDistance * 2;
	let usePreviousBallPosition = $.derived(() => game.state === 'game-over' || game.state === 'level-complete');
	let combinedPosZ = $.derived(() => $.get(usePreviousBallPosition) ? game.ballPosition.z : startAtPosZ);
	let combinedPosX = $.derived(() => $.get(usePreviousBallPosition) ? game.ballPosition.x : game.playerPosition);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			get 'position.z'() {
				return $.get(combinedPosZ);
			},

			get 'position.x'() {
				return $.get(combinedPosX);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				T(node_1, {
					get is() {
						return ballGeometry;
					}
				});

				var node_2 = $.sibling(node_1, 2);

				T(node_2, {
					get is() {
						return ballMaterial;
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}