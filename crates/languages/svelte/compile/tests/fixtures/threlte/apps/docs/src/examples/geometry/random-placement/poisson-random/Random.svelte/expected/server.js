import * as $ from 'svelte/internal/server';
import { radius, width, height } from './stores';
import { AdaptedPoissonDiscSample as Sampler } from './sampling';
import Bushes from './assets/bush.svelte';

export default function Random($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// The following component started as a copy from https://fun-bit.vercel.app/
		const sampler = $.derived(() => new Sampler($.store_get($$store_subs ??= {}, '$radius', radius), [width, height], undefined, Math.random));

		const points = $.derived(() => {
			const results = sampler().GeneratePoints();

			for (const result of results) {
				result.push(Math.random(), Math.random());
			}

			return results;
		});

		Bushes($$renderer, { transformData: points() });

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}