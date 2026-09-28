import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import FlyingBehaviour from '../behaviours/FlyingBehaviour.svelte';

export default function FlyerSprites($$anchor, $$props) {
	$.push($$props, true);

	let billboarding = $.prop($$props, 'billboarding', 3, false);

	const demonSpriteMeta = [
		{
			url: '/textures/sprites/cacodaemon.png',
			type: 'rowColumn',
			width: 8,
			height: 4,
			animations: [
				{ name: 'fly', frameRange: [0, 5] },
				{ name: 'attack', frameRange: [8, 13] },
				{ name: 'idle', frameRange: [16, 19] },
				{ name: 'death', frameRange: [24, 31] }
			]
		}
	];

	const flyerSheetbuilder = buildSpritesheet.from(demonSpriteMeta);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => flyerSheetbuilder.spritesheet, null, ($$anchor, spritesheet) => {
		InstancedSprite($$anchor, {
			count: 2000,
			playmode: 'FORWARD',
			get fps() {
				return $$props.fps;
			},

			get billboarding() {
				return billboarding();
			},
			randomPlaybackOffset: 1,
			castShadow: true,
			get spritesheet() {
				return $.get(spritesheet);
			},

			children: ($$anchor, $$slotProps) => {
				FlyingBehaviour($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}