import * as $ from 'svelte/internal/server';
import { game } from '../../Game.svelte';
import BallOut from './BallOut.svelte';
import DynamicBall from './DynamicBall.svelte';
import StaticBall from './StaticBall.svelte';

export default function Ball($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		if (game.state === 'playing') {
			$$renderer.push('<!--[0-->');
			DynamicBall($$renderer, { startAtPosX: game.playerPosition });
		} else if (game.state === 'game-over') {
			$$renderer.push('<!--[1-->');
			BallOut($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
			StaticBall($$renderer, {});
		}

		$$renderer.push(`<!--]-->`);
	});
}