import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useTask } from '@threlte/core';
import { Quaternion } from 'three';
import Particle from './Particle.svelte';
import { SvelteSet } from 'svelte/reactivity';

export default function Emitter($$anchor, $$props) {
	$.push($$props, true);

	let bodies = new SvelteSet();
	let lastBodyMounted = 0;
	let bodyEveryMilliseconds = 100;
	let longevityMilliseconds = 8000;
	const quaternion = new Quaternion();

	useTask(() => {
		const now = performance.now();

		if (lastBodyMounted + bodyEveryMilliseconds < now) {
			const body = {
				mounted: now,
				position: [0, 15, 0],
				quaternion: quaternion.random().toArray()
			};

			bodies.add(body);
			lastBodyMounted = now;
		}

		bodies.forEach((body) => {
			if (body.mounted + longevityMilliseconds < now) {
				bodies.delete(body);
			}
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => bodies, (body) => body, ($$anchor, body) => {
		Particle($$anchor, $.spread_props(() => body));
	});

	$.append($$anchor, fragment);
	$.pop();
}