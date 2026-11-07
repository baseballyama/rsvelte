import * as $ from 'svelte/internal/server';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import WalkingBehaviour from '../behaviours/WalkingBehaviour.svelte';

export default function DudeSprites($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { billboarding = false, fps } = $$props;
		const player = buildSpritesheet.fromAseprite('/textures/sprites/player.json', '/textures/sprites/player.png');

		$.await($$renderer, player, () => {}, (spritesheet) => {
			InstancedSprite($$renderer, {
				spritesheet,
				count: 4000,
				playmode: 'FORWARD',
				fps,
				billboarding,
				castShadow: true,
				children: ($$renderer) => {
					WalkingBehaviour($$renderer, {});
				},
				$$slots: { default: true }
			});
		});

		$$renderer.push(`<!--]-->`);
	});
}