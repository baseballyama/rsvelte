import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { game } from '../../Game.svelte';
import BallOut from './BallOut.svelte';
import DynamicBall from './DynamicBall.svelte';
import StaticBall from './StaticBall.svelte';

export default function Ball($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			DynamicBall($$anchor, {
				get startAtPosX() {
					return game.playerPosition;
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			BallOut($$anchor, {});
		};

		var alternate = ($$anchor) => {
			StaticBall($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (game.state === 'playing') $$render(consequent); else if (game.state === 'game-over') $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}