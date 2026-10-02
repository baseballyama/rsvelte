import * as $ from 'svelte/internal/server';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import FlyingBehaviour from '../behaviours/FlyingBehaviour.svelte';

export default function FlyerSprites($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { billboarding = false, fps } = $$props;

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

		$.await($$renderer, flyerSheetbuilder.spritesheet, () => {}, (spritesheet) => {
			InstancedSprite($$renderer, {
				count: 2000,
				playmode: 'FORWARD',
				fps,
				billboarding,
				randomPlaybackOffset: 1,
				castShadow: true,
				spritesheet,
				children: ($$renderer) => {
					FlyingBehaviour($$renderer, {});
				},
				$$slots: { default: true }
			});
		});

		$$renderer.push(`<!--]-->`);
	});
}