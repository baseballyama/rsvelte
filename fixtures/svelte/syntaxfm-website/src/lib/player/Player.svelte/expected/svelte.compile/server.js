import * as $ from 'svelte/internal/server';
import { player } from '$state/player';
import { player_window_status } from '$state/player_window_status';
import AlbumArt from './AlbumArt.svelte';
import get_show_path from '$utilities/slug';
import Icon from '../Icon.svelte';
import ShareButton from '../share/HairButton.svelte';
import { onMount } from 'svelte';

export default function Player($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { initial_show } = $$props;

		onMount(() => {
			// Load latest show by default
			player.initialize(initial_show);
		});

		let mix_max_verb = $.derived(() => $.store_get($$store_subs ??= {}, '$player_window_status', player_window_status) === 'MINI' ? 'Maximize' : 'Minimize');

		$$renderer.push(`<section${$.attr_class(`player ${$.stringify($.store_get($$store_subs ??= {}, '$player_window_status', player_window_status))} ${$.stringify($.store_get($$store_subs ??= {}, '$player', player).status)}`, 'svelte-kzll0m')}><div class="window-controls svelte-kzll0m">`);

		if ($.store_get($$store_subs ??= {}, '$player', player).current_show) {
			$$renderer.push('<!--[0-->');

			ShareButton($$renderer, {
				show: $.store_get($$store_subs ??= {}, '$player', player).current_show
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button class="minimize svelte-kzll0m"${$.attr('aria-label', `${mix_max_verb()} Player`)}${$.attr('title', `${mix_max_verb()} Player`)}>`);
		Icon($$renderer, { name: 'minimize' });
		$$renderer.push(`<!----></button> <button class="close svelte-kzll0m" aria-label="Close Player" title="Close Player">×</button></div> <div class="player-container svelte-kzll0m">`);

		if ($.store_get($$store_subs ??= {}, '$player_window_status', player_window_status) === 'ACTIVE') {
			$$renderer.push('<!--[0-->');
			AlbumArt($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div style="flex-grow: 1;">`);

		if ($.store_get($$store_subs ??= {}, '$player', player).current_show) {
			$$renderer.push(`<!--[0--><p class="svelte-kzll0m"><a id="player_show_title"${$.attr('href', get_show_path($.store_get($$store_subs ??= {}, '$player', player).current_show))} class="svelte-kzll0m">Show #${$.escape($.store_get($$store_subs ??= {}, '$player', player).current_show?.number)} - ${$.escape($.store_get($$store_subs ??= {}, '$player', player).current_show?.title)}</a></p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <media-controller audio="" nohotkeys="" style="--media-range-track-height: 5px; --media-range-thumb-height: 15px; --media-range-thumb-border-radius: 0; --media-range-track-border-radius: 5px; --media-range-bar-color: var(--primary);--media-background-color: transparent; --media-control-background: transparent; width: 100%; --media-font-family: var(--body-font-family); --media-control-hover-background: transparent;" class="svelte-kzll0m"><audio slot="media" preload="metadata" crossorigin="anonymous"></audio> `);

		if ($.store_get($$store_subs ??= {}, '$player_window_status', player_window_status) === 'ACTIVE') {
			$$renderer.push(`<!--[0--><media-control-bar class="media-bar svelte-kzll0m"><div class="media-controls svelte-kzll0m"><media-seek-backward-button><span slot="icon">`);
			Icon($$renderer, { name: 'back-30' });
			$$renderer.push(`<!----></span></media-seek-backward-button> <media-play-button><span slot="play" style="--icon_size: 26px;">`);
			Icon($$renderer, { name: 'play' });
			$$renderer.push(`<!----></span> <span slot="pause" style="--icon_size: 26px;">`);
			Icon($$renderer, { name: 'pause' });
			$$renderer.push(`<!----></span></media-play-button> <media-seek-forward-button><span slot="icon">`);
			Icon($$renderer, { name: 'forward-30' });

			$$renderer.push(`<!----></span></media-seek-forward-button></div> <div class="media-range svelte-kzll0m"><media-time-display class="svelte-kzll0m"></media-time-display> <div class="media-range-bookmarks svelte-kzll0m"><media-time-range class="svelte-kzll0m"${$.attr_style('', {
				'--media-range-bar-color': 'var(--white)',
				'--media-range-thumb-background': 'var(--primary)'
			})}></media-time-range></div> <media-duration-display class="svelte-kzll0m"></media-duration-display></div> <div class="media-sound"><media-playback-rate-button></media-playback-rate-button> <media-mute-button></media-mute-button> <media-volume-range></media-volume-range></div></media-control-bar>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></media-controller></div></div></section>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}