import * as $ from 'svelte/internal/server';
import { getHistoryStateContext } from '../composerContext.js';
import HistoryPlugin from './HistoryPlugin.svelte';

export default function SharedHistoryPlugin($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		HistoryPlugin($$renderer, { externalHistoryState: getHistoryStateContext() });
	});
}