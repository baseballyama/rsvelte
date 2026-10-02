import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask } from '@threlte/core';
import { useInstancedSprite } from '@threlte/extras';
import { Vector2 } from 'three';
import { randomPosition } from './util';

export default function WalkingBehaviour($$anchor, $$props) {
	$.push($$props, true);

	const { updatePosition, count, sprite } = useInstancedSprite();
	const posX = Array.from({ length: count });
	const posZ = Array.from({ length: count });
	const spawnRadius = 100;

	for (let i = 0; i < count; i++) {
		const pos = randomPosition(spawnRadius);

		posX[i] = pos.x;
		posZ[i] = pos.y;
	}

	const agents = [];

	for (let i = 0; i < count; i++) {
		agents.push({ action: 'Run', timer: 0.1, velocity: [0, 1] });
	}

	const velocityHelper = new Vector2(0, 0);

	const pickAnimation = (i) => {
		const dirWords = ['Forward', 'Backward', 'Left', 'Right'];
		const agent = agents[i];
		const isHorizontal = Math.abs(agent.velocity[0] * 2) > Math.abs(agent.velocity[1]) ? 2 : 0;
		const isLeft = agent.velocity[0] > 0 ? 1 : 0;
		const isUp = agent.velocity[1] > 0 ? 0 : 1;
		const secondMod = isHorizontal ? isLeft : isUp;
		const chosenWord = dirWords.slice(0 + isHorizontal, 2 + isHorizontal);
		const animationName = `${agent.action}${chosenWord[secondMod]}`;

		return animationName;
	};

	const updateAgents = (delta) => {
		for (let i = 0; i < agents.length; i++) {
			const agent = agents[i];

			agent.timer -= delta;

			// apply velocity
			posX[i] += agent.velocity[0] * delta;

			posZ[i] += agent.velocity[1] * delta;

			// roll new behaviour when time runs out or agent gets out of bounds
			if (agent.timer < 0) {
				const runChance = 0.6 + (agent.action === 'Idle' ? 0.3 : 0);

				agent.action = Math.random() < runChance ? 'Run' : 'Idle';
				agent.timer = 5 + Math.random() * 5;

				if (agent.action === 'Run') {
					velocityHelper.set(Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(3);
					agent.velocity = velocityHelper.toArray();
				}

				const animIndex = pickAnimation(i);

				if (agent.action === 'Idle') {
					agent.velocity = [0, 0];
				}

				sprite.animation.setAt(i, animIndex);
			}
		}
	};

	useTask((delta) => {
		updateAgents(delta);

		for (let i = 0; i < count; i++) {
			updatePosition(i, [posX[i] || 0, 0.5, posZ[i] || 0]);
		}
	});

	$.pop();
}