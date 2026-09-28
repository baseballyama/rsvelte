import * as $ from 'svelte/internal/server';
import { clickOutDialog } from '$/actions/click_outside_dialog';
import { episode_share_status } from '$/state/player';
import ShareActions from './ShareActions.svelte';

export default function ShareWindow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let modal = null;
		let { show, timestamp = true } = $$props;

		async function close() {
			$.store_set(episode_share_status, false);
		}

		$$renderer.push(`<dialog class="zone svelte-l3wooq" aria-labelledby="share-header"${$.attr_style('', { '--bg': 'var(--bg-sheet)', '--fg': 'var(--fg-sheet)' })}><h2 class="h3" id="share-header">Share</h2> <section aria-label="Share Window" class="share-window"><button class="close svelte-l3wooq" aria-label="close">×</button> `);
		ShareActions($$renderer, { timestamp, show });
		$$renderer.push(`<!----></section></dialog>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}