import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { episode_share_status } from '$/state/player';
import Icon from '../Icon.svelte';

var root = $.from_html(`<button class="share svelte-a8z3u7" title="Share this episode" aria-label="Share this episode"><!></button>`);

export default function HairButton($$anchor, $$props) {
	$.push($$props, true);

	const $episode_share_status = () => $.store_get(episode_share_status, '$episode_share_status', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Why is this file called HairButton? https://github.com/syntaxfm/website/issues/1563
	async function share() {
		const is_possibly_mobile = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent);

		if (is_possibly_mobile && navigator?.share) {
			try {
				await navigator.share({
					url: `https://syntax.fm/show/${$$props.show.number}`,
					text: 'Syntax podcast ' + $$props.show.title,
					title: $$props.show.title
				});
			} catch(err) {
				// This is here because navigator throws AbortError if the user cancels the share
				return;
			}
		} else {
			$.store_set(episode_share_status, true);
		}
	}

	var button = root();
	var node = $.child(button);

	Icon(node, { name: 'share' });
	$.reset(button);
	$.delegated('click', button, share);
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);