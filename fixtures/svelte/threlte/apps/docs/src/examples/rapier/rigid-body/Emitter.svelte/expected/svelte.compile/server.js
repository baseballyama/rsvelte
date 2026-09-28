import * as $ from 'svelte/internal/server';
import { useTask } from '@threlte/core';
import { Quaternion } from 'three';
import Particle from './Particle.svelte';
import { SvelteSet } from 'svelte/reactivity';

export default function Emitter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let bodies = new SvelteSet();
		let lastBodyMounted = 0;
		let bodyEveryMilliseconds = 800;
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

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(bodies);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let body = each_array[$$index];

			Particle($$renderer, $.spread_props([body]));
		}

		$$renderer.push(`<!--]-->`);
	});
}