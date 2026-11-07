import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

export default function SpriteInstance($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 3, 0),
		position = $.prop($$props, 'position', 19, () => [0, 0, 0]),
		scale = $.prop($$props, 'scale', 19, () => [1, 1]);

	const { updatePosition, sprite } = getContext('instanced-sprite-ctx');

	$.user_pre_effect(() => {
		if (position() !== undefined) updatePosition(id(), position(), scale());
	});

	$.user_pre_effect(() => {
		if ($$props.animationName !== undefined) sprite.animation.setAt(id(), $$props.animationName);
	});

	$.user_pre_effect(() => {
		if ($$props.playmode !== undefined) sprite.playmode.setAt(id(), $$props.playmode);
	});

	$.user_pre_effect(() => {
		if ($$props.billboarding !== undefined) sprite.billboarding.setAt(id(), $$props.billboarding);
	});

	$.user_pre_effect(() => {
		if ($$props.offset !== undefined) sprite.offset.setAt(id(), $$props.offset);
	});

	$.user_pre_effect(() => {
		if ($$props.loop !== undefined) sprite.loop.setAt(id(), $$props.loop);
	});

	$.user_pre_effect(() => {
		if ($$props.flipX !== undefined) sprite.flipX.setAt(id(), $$props.flipX);
	});

	$.user_pre_effect(() => {
		if ($$props.flipY !== undefined) sprite.flipY.setAt(id(), $$props.flipY);
	});

	$.user_pre_effect(() => {
		if ($$props.frameId !== undefined) sprite.frame.setAt(id(), $$props.frameId, $$props.animationName);
	});

	$.pop();
}