import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { arenaHeight, playerHeight, playerToBorderDistance } from '../../config';
import { game } from '../../Game.svelte';
import { ballGeometry, ballMaterial } from './common';

export default function StaticBall($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const startAtPosZ = arenaHeight / 2 - playerHeight - playerToBorderDistance * 2;
		let usePreviousBallPosition = $.derived(() => game.state === 'game-over' || game.state === 'level-complete');
		let combinedPosZ = $.derived(() => usePreviousBallPosition() ? game.ballPosition.z : startAtPosZ);
		let combinedPosX = $.derived(() => usePreviousBallPosition() ? game.ballPosition.x : game.playerPosition);

		if (T.Mesh) {
			$$renderer.push('<!--[-->');

			T.Mesh($$renderer, {
				'position.z': combinedPosZ(),
				'position.x': combinedPosX(),
				children: ($$renderer) => {
					T($$renderer, { is: ballGeometry });
					$$renderer.push(`<!----> `);
					T($$renderer, { is: ballMaterial });
					$$renderer.push(`<!---->`);
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