import * as $ from 'svelte/internal/server';
import { episode_share_status } from '$/state/player';
import Icon from '../Icon.svelte';

export default function HairButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// Why is this file called HairButton? https://github.com/syntaxfm/website/issues/1563
		let { show } = $$props;

		async function share() {
			const is_possibly_mobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent);

			if (is_possibly_mobile && navigator?.share) {
				try {
					await navigator.share({
						url: `https://syntax.fm/show/${show.number}`,
						text: 'Syntax podcast ' + show.title,
						title: show.title
					});
				} catch(err) {
					// This is here because navigator throws AbortError if the user cancels the share
					return;
				}
			} else {
				$.store_set(episode_share_status, true);
			}
		}

		$$renderer.push(`<button class="share svelte-a8z3u7" title="Share this episode" aria-label="Share this episode">`);
		Icon($$renderer, { name: 'share' });
		$$renderer.push(`<!----></button>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}