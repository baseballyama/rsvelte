import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';

export default function SpriteInstance($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = 0,
			position = [0, 0, 0],
			scale = [1, 1],
			animationName,
			playmode,
			billboarding,
			offset,
			loop,
			flipX,
			flipY,
			frameId
		} = $$props;

		const { updatePosition, sprite } = getContext('instanced-sprite-ctx');
	});
}