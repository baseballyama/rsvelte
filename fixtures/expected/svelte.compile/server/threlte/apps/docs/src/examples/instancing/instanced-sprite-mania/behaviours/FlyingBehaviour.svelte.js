import * as $ from 'svelte/internal/server';
import { useTask } from '@threlte/core';
import { useInstancedSprite } from '@threlte/extras';
import { Vector2 } from 'three';
import { randomPosition } from '../util';

export default function FlyingBehaviour($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { updatePosition, count, animationMap, sprite } = useInstancedSprite();

		sprite.offset.randomizeAll();

		const agents = [];

		for (let i = 0; i < count; i++) {
			agents.push({
				action: 'Fly',
				timer: 0.1,
				velocity: [0, 1],
				baseHeight: 2 + Math.random() * 15
			});
		}

		const posX = new Array(count).fill(0);
		const posY = new Array(count).fill(0);
		const posZ = new Array(count).fill(0);
		const spawnRadius = 250;
		const minCenterDistance = 5;
		const maxCenterDistance = spawnRadius;

		for (let i = 0; i < agents.length; i++) {
			const pos = randomPosition(spawnRadius);

			posX[i] = pos.x;
			posY[i] = agents[i]?.baseHeight || 10;
			posZ[i] = pos.y;
		}

		const velocityHelper = new Vector2(0, 0);
		let totalTime = 0;

		const updateAgents = (delta) => {
			for (let i = 0; i < agents.length; i++) {
				// timer
				const agent = agents[i];

				if (!agent) return;

				agent.timer -= delta;
				totalTime += delta;

				// apply velocity
				posX[i] += agent.velocity[0] * delta;

				posY[i] = agent.baseHeight + Math.sin(totalTime * 0.00005 + i);
				posZ[i] += agent.velocity[1] * delta;

				// roll new behaviour when time runs out or agent gets out of bounds
				if (i > 0) {
					const dist = Math.sqrt((posX[i] || 0) ** 2 + (posZ[i] || 0) ** 2);

					if (agent.timer < 0 || dist < minCenterDistance || dist > maxCenterDistance) {
						const FlyChance = 0.6 + (agent.action === 'Idle' ? 0.3 : 0);

						agent.action = Math.random() < FlyChance ? 'Fly' : 'Idle';
						agent.timer = 5 + Math.random() * 5;

						if (agent.action === 'Fly') {
							velocityHelper.set(Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(4.5);
							agent.velocity = velocityHelper.toArray();

							if (velocityHelper.x > 0) {
								sprite.flipX.setAt(i, false);
							} else {
								sprite.flipX.setAt(i, true);
							}
						}
					}
				}
			}
		};

		useTask((_delta) => {
			if ($.store_get($$store_subs ??= {}, '$animationMap', animationMap).size > 0) {
				updateAgents(_delta);
			}

			for (let i = 0; i < count; i++) {
				updatePosition(i, [posX[i] || 0, posY[i] || 0, posZ[i] || 0], [5, 5]);
				sprite.animation.setAt(i, 0);
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}