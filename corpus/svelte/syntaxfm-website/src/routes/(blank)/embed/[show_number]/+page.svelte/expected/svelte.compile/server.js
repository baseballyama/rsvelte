import * as $ from 'svelte/internal/server';
import '$/routes/(site)/style.css';
import { format } from 'date-fns';
import Icon from '$/lib/Icon.svelte';
import ListenLinks from '$/lib/ListenLinks.svelte';
import AlbumArt from '$/lib/player/AlbumArt.svelte';
import ShareButton from '$/lib/share/HairButton.svelte';
import { Toaster } from 'svelte-french-toast';
import ShareActions from '$/lib/share/ShareActions.svelte';
import { fade } from 'svelte/transition';
import { episode_share_status } from '$/state/player.js';
import { browser } from '$app/environment';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		let show = $.derived(() => data.show);

		function toggle_share() {
			$.store_set(episode_share_status, !$.store_get($$store_subs ??= {}, '$episode_share_status', episode_share_status));
		}

		$$renderer.push(`<div class="theme-system theme-wrapper zone"><figure class="zone svelte-5isbmk"${$.attr_style('', { '--bg': 'var(--black)', '--fg': 'var(--white)' })}><span class="show-number fst-900 grit svelte-5isbmk"${$.attr_style('', {
			'--transition-name': `show-date-${$.stringify(show().number)}`
		})}>${$.escape(show().number)}</span> <p class="show-page-date svelte-5isbmk"${$.attr_style('', {
			'--transition-name': `show-date-${$.stringify(show().number)}`
		})}>${$.escape(format(new Date(show().date), 'MMMM do, yyyy'))}</p> <h1 class="svelte-5isbmk"><span class="spa-ran-wrap">${$.escape(show().title)}</span></h1> <div class="player-container svelte-5isbmk">`);

		AlbumArt($$renderer, { is_link: true, show: show() });
		$$renderer.push(`<!----> `);

		if (browser) {
			$$renderer.push(`<!--[0--><media-controller audio="" style="--media-range-track-height: 5px; --media-range-thumb-height: 15px; --media-range-thumb-border-radius: 0; --media-range-track-border-radius: 5px; --media-range-bar-color: var(--primary);--media-background-color: transparent; --media-control-background: transparent; width: 100%; --media-font-family: var(--body-font-family); --media-control-hover-background: transparent;" class="svelte-5isbmk"><audio slot="media" preload="metadata" crossorigin="anonymous"${$.attr('src', show().url)}></audio> <media-control-bar class="media-bar svelte-5isbmk"><div class="media-controls svelte-5isbmk"><media-play-button><span slot="play" style="--icon_size: 32px;">`);
			Icon($$renderer, { name: 'play' });
			$$renderer.push(`<!----></span> <span slot="pause" style="--icon_size: 32px;">`);
			Icon($$renderer, { name: 'pause' });

			$$renderer.push(`<!----></span></media-play-button></div> <div class="media-range svelte-5isbmk"><media-time-display></media-time-display> <div class="media-range-bookmarks svelte-5isbmk"><media-time-range class="svelte-5isbmk"${$.attr_style('', {
				'--media-range-bar-color': 'var(--white)',
				'--media-range-thumb-background': 'var(--primary)'
			})}></media-time-range></div> <media-duration-display></media-duration-display></div> <div class="media-sound"><media-playback-rate-button></media-playback-rate-button></div></media-control-bar></media-controller>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="embed-actions svelte-5isbmk">`);
		ShareButton($$renderer, { show: show() });
		$$renderer.push(`<!----> `);
		ListenLinks($$renderer, { show: show() });
		$$renderer.push(`<!----> <a target="_blank" class="icon" title="Download Episode" aria-label="Download" download=""${$.attr('href', show().url)}>`);
		Icon($$renderer, { name: 'download' });
		$$renderer.push(`<!----></a></div> `);

		if ($.store_get($$store_subs ??= {}, '$episode_share_status', episode_share_status)) {
			$$renderer.push(`<!--[0--><div class="overtake svelte-5isbmk"><button class="close svelte-5isbmk">×</button> `);
			ShareActions($$renderer, { show: show(), timestamp: false });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></figure></div> `);
		Toaster($$renderer, {});
		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}