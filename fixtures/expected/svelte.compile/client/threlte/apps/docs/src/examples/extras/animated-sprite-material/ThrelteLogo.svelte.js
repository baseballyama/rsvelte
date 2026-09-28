import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { AnimatedSpriteMaterial } from '@threlte/extras';

export default function ThrelteLogo($$anchor, $$props) {
	$.push($$props, true);

	let animation = $.state('Hidden');
	let mounted = false;

	$.user_effect(() => {
		if (mounted && $$props.show) {
			$.set(animation, 'In');
		} else if (!$$props.show && $.get(animation) === 'In') {
			$.set(animation, 'Out');
		} else {
			mounted = true;
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Sprite, ($$anchor, T_Sprite) => {
		T_Sprite($$anchor, {
			scale: [3.5, 1.75, 3.5],
			'position.y': 0.2,
			children: ($$anchor, $$slotProps) => {
				AnimatedSpriteMaterial($$anchor, {
					textureUrl: '/textures/sprites/Threlte_7.png',
					dataUrl: '/textures/sprites/Threlte_7.json',
					get animation() {
						return $.get(animation);
					},
					autoplay: true,
					loop: false
				});
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}