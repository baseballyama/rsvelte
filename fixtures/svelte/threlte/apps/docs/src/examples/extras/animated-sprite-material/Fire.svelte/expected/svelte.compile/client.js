import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { AnimatedSpriteMaterial } from '@threlte/extras';
import { PointLight } from 'three';

var root = $.from_html(`<!> <!>`, 1);

export default function Fire($$anchor, $$props) {
	$.push($$props, true);

	const light = new PointLight('#FF893D', 100);
	let rate = 1 / 10;
	let fixedStepTimeAccumulator = 0;

	useTask((delta) => {
		fixedStepTimeAccumulator += delta;

		while (fixedStepTimeAccumulator >= rate) {
			fixedStepTimeAccumulator -= rate;

			// random light intensity between 22 and 44
			light.intensity = Math.random() * 24 + 22;
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => T.Sprite, ($$anchor, T_Sprite) => {
		T_Sprite($$anchor, {
			'position.y': -2.3,
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				AnimatedSpriteMaterial(node_1, {
					textureUrl: '/textures/sprites/fire.png',
					totalFrames: 8,
					fps: 10
				});

				var node_2 = $.sibling(node_1, 2);

				T(node_2, {
					get is() {
						return light;
					},
					distance: 1.8,
					decay: 0.5,
					'position.y': -0.2,
					'position.z': 0.02
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}