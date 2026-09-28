import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from 'svelte/reactivity';
import Ball from './Ball.svelte';
import { spawnQueue } from './spawnQueue.svelte';

export default function Balls($$anchor, $$props) {
	$.push($$props, true);

	const balls = new SvelteSet();
	let nextId = 0;

	spawnQueue.spawn = (x, y, vx, vy) => {
		balls.add({
			id: nextId++,
			position: [x, y, 0],
			linearVelocity: [vx, vy, 0]
		});
	};

	spawnQueue.despawn = (id) => {
		for (const b of balls) {
			if (b.id === id) {
				balls.delete(b);

				return;
			}
		}
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => balls, (ball) => ball.id, ($$anchor, ball) => {
		Ball($$anchor, {
			get id() {
				return $.get(ball).id;
			},

			get position() {
				return $.get(ball).position;
			},

			get linearVelocity() {
				return $.get(ball).linearVelocity;
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}