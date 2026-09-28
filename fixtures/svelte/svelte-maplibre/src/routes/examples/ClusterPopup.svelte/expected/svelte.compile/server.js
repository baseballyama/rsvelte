import * as $ from 'svelte/internal/server';
import { getSource, getMapContext } from '$lib/context.svelte.js';

export default function ClusterPopup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map);

		const source = getSource();
		let { feature } = $$props;

		let innerFeaturesPromise = $.derived(async () => {
			if (!map() || !source?.value || !feature) {
				return [];
			}

			const features = await map().getSource(source.value)?.getClusterLeaves(feature.properties.cluster_id, 10000, 0) ?? [];

			features.sort((a, b) => {
				return b.properties.time - a.properties.time;
			});

			return features;
		});

		// Use this instead of an await template tag to avoid flickering
		let innerFeatures = [];

		$$renderer.push(`<p>Most recent quakes</p> <!--[-->`);

		const each_array = $.ensure_array_like(innerFeatures.slice(0, 10));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let feat = each_array[$$index];

			$$renderer.push(`<div class="text-sm">${$.escape(new Date(feat.properties.time).toLocaleDateString())} - ${$.escape(feat.properties.mag)}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}