import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getSource, getMapContext } from './context.svelte.js';

export default function JoinedData($$anchor, $$props) {
	$.push($$props, true);

	let sourceLayer = $.prop($$props, 'sourceLayer', 3, undefined);
	let lastSeenIds = new Set();

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map);

	const source = getSource();

	$.user_effect(() => {
		if ($$props.data && $.get(map) && source?.value) {
			let seenIds = new Set();

			for (const row of $$props.data) {
				const id = row[$$props.idCol];

				if (!id) continue;

				lastSeenIds.delete(id);
				seenIds.add(id);

				const featureSelector = { id, source: source.value, sourceLayer: sourceLayer() };
				const oldState = $.get(map).getFeatureState(featureSelector);
				let needsUpdate = false;

				// Avoid updates for features which are the same
				for (const property of Object.keys(row)) {
					if (oldState[property] !== row[property]) {
						needsUpdate = true;

						break;
					}
				}

				if (needsUpdate) {
					$.get(map).setFeatureState(featureSelector, row);
				}
			}

			for (const removeId of lastSeenIds) {
				const featureSelector = {
					id: removeId,
					source: source.value,
					sourceLayer: sourceLayer()
				};

				// MapLibre manages each key in the feature state independently, and we don't want to
				// clear state set from elsewhere such as hover state, so we need to clear each key explicitly.
				const oldState = $.get(map).getFeatureState(featureSelector);

				for (const property of Object.keys(oldState)) {
					$.get(map).removeFeatureState(featureSelector, property);
				}
			}

			lastSeenIds = seenIds;
		}
	});

	$.pop();
}