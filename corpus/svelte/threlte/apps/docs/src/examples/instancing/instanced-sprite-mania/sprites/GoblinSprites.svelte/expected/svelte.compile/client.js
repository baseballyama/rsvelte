import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask } from '@threlte/core';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import { Matrix4 } from 'three';

export default function GoblinSprites($$anchor, $$props) {
	$.push($$props, true);

	let billboarding = $.prop($$props, 'billboarding', 3, false);

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
	let spriteMesh = $.state(void 0);
	const goblinCount = 80;
	const goblinPositionSpread = 50;
	const tempMatrix = new Matrix4();
	let animationNames = $.state($.proxy([]));

	/**
	 * GOBLIN LOGIC -
	 * randomize positions by directly accessing the instanced sprite api without any helpers
	 */
	$.user_effect(() => {
		if ($.get(spriteMesh)) {
			//
			for (let i = 0; i < goblinCount; i++) {
				tempMatrix.makeScale(5, 5, 1);
				tempMatrix.setPosition(Math.random() * goblinPositionSpread - goblinPositionSpread / 2, 0.85, Math.random() * goblinPositionSpread - goblinPositionSpread / 2);
				$.get(spriteMesh).setMatrixAt(i, tempMatrix);
			}

			$.set(animationNames, Object.keys($.get(spriteMesh).spritesheet.animations), true);
		}
	});

	let goblinId = 0;

	useTask(() => {
		if ($.get(spriteMesh)) {
			// Pick a random animation for a goblin, 1 change per frame
			$.get(spriteMesh).animation.setAt(goblinId, $.get(animationNames)[Math.floor(Math.random() * $.get(animationNames).length)]);
		}

		goblinId++;

		if (goblinId > goblinCount) goblinId = 0;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => goblinSpritesheet.spritesheet, null, ($$anchor, spritesheet) => {
		InstancedSprite($$anchor, {
			count: goblinCount,
			playmode: 'FORWARD',
			get spritesheet() {
				return $.get(spritesheet);
			},

			get fps() {
				return $$props.fps;
			},

			get billboarding() {
				return billboarding();
			},
			castShadow: true,
			get ref() {
				return $.get(spriteMesh);
			},

			set ref($$value) {
				$.set(spriteMesh, $$value, true);
			}
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}