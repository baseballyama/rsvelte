import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getHistoryStateContext } from '../composerContext.js';
import HistoryPlugin from './HistoryPlugin.svelte';

export default function SharedHistoryPlugin($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(getHistoryStateContext);

		HistoryPlugin($$anchor, {
			get externalHistoryState() {
				return $.get($0);
			}
		});
	}

	$.pop();
}