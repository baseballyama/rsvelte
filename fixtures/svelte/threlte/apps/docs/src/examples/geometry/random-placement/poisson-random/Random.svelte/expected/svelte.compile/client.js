import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { radius, width, height } from './stores';
import { AdaptedPoissonDiscSample as Sampler } from './sampling';
import Bushes from './assets/bush.svelte';

export default function Random($$anchor, $$props) {
	$.push($$props, true);

	const $radius = () => $.store_get(radius, '$radius', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// The following component started as a copy from https://fun-bit.vercel.app/
	const sampler = $.derived(() => new Sampler($radius(), [width, height], undefined, Math.random));

	const points = $.derived(() => {
		const results = $.get(sampler).GeneratePoints();

		for (const result of results) {
			result.push(Math.random(), Math.random());
		}

		return results;
	});

	Bushes($$anchor, {
		get transformData() {
			return $.get(points);
		}
	});

	$.pop();
	$$cleanup();
}