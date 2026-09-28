import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getId } from './context.svelte.js';
import GeoJSON from './GeoJSON.svelte';

export default function TopoJSON($$anchor, $$props) {
	$.push($$props, true);

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
	let data = $.prop($$props, 'data', 3, undefined),
		url = $.prop($$props, 'url', 3, undefined),
		objectName = $.prop($$props, 'objectName', 3, undefined),
		id = $.prop($$props, 'id', 19, () => getId('topojson')),
		generateId = $.prop($$props, 'generateId', 3, false),
		promoteId = $.prop($$props, 'promoteId', 3, undefined),
		filter = $.prop($$props, 'filter', 3, undefined),
		lineMetrics = $.prop($$props, 'lineMetrics', 3, undefined),
		cluster = $.prop($$props, 'cluster', 3, undefined),
		maxzoom = $.prop($$props, 'maxzoom', 3, undefined),
		attribution = $.prop($$props, 'attribution', 3, undefined),
		buffer = $.prop($$props, 'buffer', 3, undefined),
		tolerance = $.prop($$props, 'tolerance', 3, undefined),
		ondata = $.prop($$props, 'ondata', 3, undefined),
		onerror = $.prop($$props, 'onerror', 3, undefined);

	let geojson = $.state(undefined);

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

		onerror()?.(msg);

		if (!onerror()) console.error('TopoJSON:', msg);
	}

	// Warn if both data and url are provided
	$.user_effect(() => {
		if (data() && url()) {
			console.warn('TopoJSON: both `data` and `url` provided — `url` takes precedence');
		}
	});

	// Convert from `data` prop (only when url is not provided)
	$.user_effect(() => {
		if (data() && !url()) {
			convert(data(), objectName()).then((fc) => {
				$.set(geojson, fc, true);
				ondata()?.(fc);
			}).catch(handleError);
		}
	});

	// Fetch + convert from `url` prop
	$.user_effect(() => {
		if (!url()) return;

		const controller = new AbortController();

		fetch(url(), { signal: controller.signal }).then((res) => {
			if (!res.ok) throw new Error(`TopoJSON fetch failed: ${res.status} ${url()}`);

			return res.json();
		}).then((topo) => convert(topo, objectName())).then((fc) => {
			$.set(geojson, fc, true);
			ondata()?.(fc);
		}).catch((err) => {
			if (controller.signal.aborted) return;

			handleError(err);
		});

		return () => {
			controller.abort();
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			GeoJSON($$anchor, {
				get data() {
					return $.get(geojson);
				},

				get id() {
					return id();
				},

				get generateId() {
					return generateId();
				},

				get promoteId() {
					return promoteId();
				},

				get filter() {
					return filter();
				},

				get lineMetrics() {
					return lineMetrics();
				},

				get cluster() {
					return cluster();
				},

				get maxzoom() {
					return maxzoom();
				},

				get attribution() {
					return attribution();
				},

				get buffer() {
					return buffer();
				},

				get tolerance() {
					return tolerance();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if ($.get(geojson)) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}