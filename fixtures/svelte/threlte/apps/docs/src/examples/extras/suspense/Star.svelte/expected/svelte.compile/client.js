import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask } from '@threlte/core';
import { Instance } from '@threlte/extras';
import { Color } from 'three';

export default function Star($$anchor, $$props) {
	$.push($$props, true);

	let positionX = Math.random() * 100 - 50;
	let positionY = Math.random() * 100 - 50;
	let positionZ = $.state(Math.random() * 100 - 50);
	const colors = ['#FFF09E', '#B8DFFF', '#CADBFF', '#FFEBBE'];

	// random element from array
	const color = new Color(colors[Math.floor(Math.random() * colors.length)]);

	useTask((delta) => {
		const f = 1 / 60 / delta;

		$.set(positionZ, $.get(positionZ) - 15 * f);

		if ($.get(positionZ) < -100) {
			$.set(positionZ, 100);
		}
	});

	Instance($$anchor, {
		get color() {
			return color;
		},

		get 'position.x'() {
			return positionX;
		},

		get 'position.y'() {
			return positionY;
		},

		get 'position.z'() {
			return $.get(positionZ);
		}
	});

	$.pop();
}