import * as $ from 'svelte/internal/server';
import { getId } from './context.svelte.js';
import GeoJSON from './GeoJSON.svelte';

export default function TopoJSON($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** A TopoJSON Topology object. Mutually exclusive with `url`. */
		/** URL to a TopoJSON file. Fetched and converted automatically. Mutually exclusive with `data`. */
		/** Which named object to extract. Defaults to the first object key. */
		/** Source ID. Defaults to `topojson-N`. */
		/** Generate a unique id for each feature. This will overwrite existing IDs. */
		/** Use this property on the feature as the ID. This will overwrite existing IDs. */
		/** True to calculate line lengths. Required to use a line layer that
		 * uses the "line-gradient" paint property. */
		/** Cluster configuration. Only applies to point-feature topologies — polygon/line
		 * geometries will silently ignore this option. */
		/** Called with the converted FeatureCollection when data is ready. */
		/** Called when fetch or conversion fails. */
		let {
			data = undefined,
			url = undefined,
			objectName = undefined,
			id = getId('topojson'),
			generateId = false,
			promoteId = undefined,
			filter = undefined,
			lineMetrics = undefined,
			cluster = undefined,
			maxzoom = undefined,
			attribution = undefined,
			buffer = undefined,
			tolerance = undefined,
			ondata = undefined,
			onerror = undefined,
			children
		} = $$props;

		let geojson = undefined;

		/**
		 * Convert a TopoJSON Topology to a GeoJSON FeatureCollection.
		 * Uses topojson-client dynamically to keep it as an optional peer dependency.
		 */
		async function convert(topo, name) {
			const { feature } = await import('topojson-client');
			const key = name ?? Object.keys(topo.objects)[0];

			if (!key) throw new Error('TopoJSON topology has no objects');

			const result = feature(topo, key);

			if ('features' in result) return result;

			return { type: 'FeatureCollection', features: [result] };
		}

		function handleError(err) {
			const msg = err instanceof Error ? err.message : String(err);

			onerror?.(msg);

			if (!onerror) console.error('TopoJSON:', msg);
		}

		if (// Warn if both data and url are provided
		// Convert from `data` prop (only when url is not provided)
		// Fetch + convert from `url` prop
		geojson) {
			$$renderer.push('<!--[0-->');

			GeoJSON($$renderer, {
				data: geojson,
				id,
				generateId,
				promoteId,
				filter,
				lineMetrics,
				cluster,
				maxzoom,
				attribution,
				buffer,
				tolerance,
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}