import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import FlyingBehaviourHook from '../behaviours/FlyingBehaviourHook.svelte';

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

const cacodaemonSpritesheet = buildSpritesheet.from(demonSpriteMeta);

export const useDemonSprite = cacodaemonSpritesheet.useInstancedSprite;

export default function FlyerSpritesTyped($$anchor, $$props) {
	$.push($$props, true);

	let billboarding = $.prop($$props, 'billboarding', 3, false);
	const count = 2000;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => cacodaemonSpritesheet.spritesheet, null, ($$anchor, spritesheet) => {
		InstancedSprite($$anchor, {
			count,
			get billboarding() {
				return billboarding();
			},

			get spritesheet() {
				return $.get(spritesheet);
			},
			castShadow: true,
			hueShift: { h: 0.3, s: 1.5, v: 1.5 },
			children: ($$anchor, $$slotProps) => {
				FlyingBehaviourHook($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}