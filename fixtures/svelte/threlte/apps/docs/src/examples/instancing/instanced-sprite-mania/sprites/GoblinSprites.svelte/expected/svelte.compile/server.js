import * as $ from 'svelte/internal/server';
import { useTask } from '@threlte/core';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import { Matrix4 } from 'three';

export default function GoblinSprites($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { billboarding = false, fps } = $$props;

		// DECLARE SPRIRESHEET META & BUILD IT
		const goblinSpriteMeta = [
			{
				url: '/textures/sprites/goblin/Attack.png',
				type: 'rowColumn',
				width: 8,
				height: 1,
				animations: [{ name: 'attack', frameRange: [0, 7] }]
			},

			{
				url: '/textures/sprites/goblin/Death.png',
				type: 'rowColumn',
				width: 4,
				height: 1,
				animations: [{ name: 'death', frameRange: [0, 3] }]
			},

			{
				url: '/textures/sprites/goblin/Idle.png',
				type: 'rowColumn',
				width: 4,
				height: 1,
				animations: [{ name: 'idle', frameRange: [0, 3] }]
			},

			{
				url: '/textures/sprites/goblin/Run.png',
				type: 'rowColumn',
				width: 8,
				height: 1,
				animations: [{ name: 'run', frameRange: [0, 8] }]
			},

			{
				url: '/textures/sprites/goblin/TakeHit.png',
				type: 'rowColumn',
				width: 4,
				height: 1,
				animations: [{ name: 'takeHit', frameRange: [0, 3] }]
			}
		];

		const goblinSpritesheet = buildSpritesheet.from(goblinSpriteMeta);
		let spriteMesh = void 0;
		const goblinCount = 80;
		const goblinPositionSpread = 50;
		const tempMatrix = new Matrix4();
		let animationNames = [];

		/**
		 * GOBLIN LOGIC -
		 * randomize positions by directly accessing the instanced sprite api without any helpers
		 */
		//
		let goblinId = 0;

		useTask(() => {
			if (spriteMesh) {
				// Pick a random animation for a goblin, 1 change per frame
				spriteMesh.animation.setAt(goblinId, animationNames[Math.floor(Math.random() * animationNames.length)]);
			}

			goblinId++;

			if (goblinId > goblinCount) goblinId = 0;
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.await($$renderer, goblinSpritesheet.spritesheet, () => {}, (spritesheet) => {
				InstancedSprite($$renderer, {
					count: goblinCount,
					playmode: 'FORWARD',
					spritesheet,
					fps,
					billboarding,
					castShadow: true,
					get ref() {
						return spriteMesh;
					},

					set ref($$value) {
						spriteMesh = $$value;
						$$settled = false;
					}
				});
			});

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}