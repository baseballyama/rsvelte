import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';
import Ball from './Ball.svelte';
import { spawnQueue } from './spawnQueue.svelte';

export default function Balls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(balls);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let ball = each_array[$$index];

			Ball($$renderer, {
				id: ball.id,
				position: ball.position,
				linearVelocity: ball.linearVelocity
			});
		}

		$$renderer.push(`<!--]-->`);
	});
}