import * as $ from 'svelte/internal/server';
import { getSource, getMapContext } from './context.svelte.js';

export default function JoinedData($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, idCol, sourceLayer = undefined } = $$props;
		let lastSeenIds = new Set();

		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map);

		const source = getSource();
		// Avoid updates for features which are the same
		// MapLibre manages each key in the feature state independently, and we don't want to
		// clear state set from elsewhere such as hover state, so we need to clear each key explicitly.
	});
}