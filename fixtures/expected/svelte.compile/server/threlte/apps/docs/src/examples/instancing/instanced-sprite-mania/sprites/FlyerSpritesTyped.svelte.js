import * as $ from 'svelte/internal/server';
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

export default function FlyerSpritesTyped($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { billboarding = false } = $$props;
		const count = 2000;

		$.await($$renderer, cacodaemonSpritesheet.spritesheet, () => {}, (spritesheet) => {
			InstancedSprite($$renderer, {
				count,
				billboarding,
				spritesheet,
				castShadow: true,
				hueShift: { h: 0.3, s: 1.5, v: 1.5 },
				children: ($$renderer) => {
					FlyingBehaviourHook($$renderer, {});
				},
				$$slots: { default: true }
			});
		});

		$$renderer.push(`<!--]-->`);
	});
}