import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import WalkingBehaviour from '../behaviours/WalkingBehaviour.svelte';

export default function DudeSprites($$anchor, $$props) {
	$.push($$props, true);

	let billboarding = $.prop($$props, 'billboarding', 3, false);
	const player = buildSpritesheet.fromAseprite('/textures/sprites/player.json', '/textures/sprites/player.png');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => player, null, ($$anchor, spritesheet) => {
		InstancedSprite($$anchor, {
			get spritesheet() {
				return $.get(spritesheet);
			},
			count: 4000,
			playmode: 'FORWARD',
			get fps() {
				return $$props.fps;
			},

			get billboarding() {
				return billboarding();
			},
			castShadow: true,
			children: ($$anchor, $$slotProps) => {
				WalkingBehaviour($$anchor, {});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}