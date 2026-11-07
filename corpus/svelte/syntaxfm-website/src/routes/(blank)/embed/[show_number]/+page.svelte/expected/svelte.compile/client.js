import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<media-controller><audio slot="media" preload="metadata" crossorigin="anonymous"></audio> <media-control-bar><div class="media-controls svelte-5isbmk"><media-play-button><span slot="play" style="--icon_size: 32px;"><!></span> <span slot="pause" style="--icon_size: 32px;"><!></span></media-play-button></div> <div class="media-range svelte-5isbmk"><media-time-display></media-time-display> <div class="media-range-bookmarks svelte-5isbmk"><media-time-range></media-time-range></div> <media-duration-display></media-duration-display></div> <div class="media-sound"><media-playback-rate-button></media-playback-rate-button></div></media-control-bar></media-controller>`, 2);
var root_1 = $.from_html(`<div class="overtake svelte-5isbmk"><button class="close svelte-5isbmk">×</button> <!></div>`);
var root_2 = $.from_html(`<div><figure class="zone svelte-5isbmk"><span class="show-number fst-900 grit svelte-5isbmk"> </span> <p class="show-page-date svelte-5isbmk"> </p> <h1 class="svelte-5isbmk"><span class="spa-ran-wrap"> </span></h1> <div class="player-container svelte-5isbmk"><!> <!></div> <div class="embed-actions svelte-5isbmk"><!> <!> <a target="_blank" class="icon" title="Download Episode" aria-label="Download" download=""><!></a></div> <!></figure></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $episode_share_status = () => $.store_get(episode_share_status, '$episode_share_status', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let show = $.derived(() => $$props.data.show);

	function toggle_share() {
		$.store_set(episode_share_status, !$episode_share_status());
	}

	var fragment = root_2();
	var div = $.first_child(fragment);

	$.set_class(div, 1, 'theme-system theme-wrapper zone');

	var figure = $.child(div);

	$.set_style(figure, '', {}, { '--bg': 'var(--black)', '--fg': 'var(--white)' });

	var span = $.child(figure);
	let styles;
	var text = $.only_child(span, true);
	var p = $.sibling(span, 2);
	let styles_1;
	var text_1 = $.only_child(p, true);
	var h1 = $.sibling(p, 2);
	var span_1 = $.child(h1);
	var text_2 = $.only_child(span_1, true);

	$.reset(h1);

	var div_1 = $.sibling(h1, 2);
	var node = $.child(div_1);

	AlbumArt(node, {
		is_link: true,
		get show() {
			return $.get(show);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var media_controller = root();

			$.set_custom_element_data(media_controller, 'audio', true);
			$.set_style(media_controller, '--media-range-track-height: 5px; --media-range-thumb-height: 15px; --media-range-thumb-border-radius: 0;	--media-range-track-border-radius: 5px; --media-range-bar-color: var(--primary);--media-background-color: transparent; --media-control-background: transparent; width: 100%; --media-font-family: var(--body-font-family); --media-control-hover-background: transparent; ');
			$.set_class(media_controller, 1, 'svelte-5isbmk');

			var audio = $.child(media_controller);
			var media_control_bar = $.sibling(audio, 2);

			$.set_class(media_control_bar, 1, 'media-bar svelte-5isbmk');

			var div_2 = $.child(media_control_bar);
			var media_play_button = $.child(div_2);
			var span_2 = $.child(media_play_button);
			var node_2 = $.child(span_2);

			Icon(node_2, { name: 'play' });
			$.reset(span_2);

			var span_3 = $.sibling(span_2, 2);
			var node_3 = $.child(span_3);

			Icon(node_3, { name: 'pause' });
			$.reset(span_3);
			$.reset(media_play_button);
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var media_time_display = $.child(div_3);
			var div_4 = $.sibling(media_time_display, 2);
			var media_time_range = $.child(div_4);

			$.set_class(media_time_range, 1, 'svelte-5isbmk');

			$.set_style(media_time_range, '', {}, {
				'--media-range-bar-color': 'var(--white)',
				'--media-range-thumb-background': 'var(--primary)'
			});

			$.reset(div_4);

			var media_duration_display = $.sibling(div_4, 2);

			$.reset(div_3);
			$.next(2);
			$.reset(media_control_bar);
			$.reset(media_controller);
			$.template_effect(() => $.set_attribute(audio, 'src', $.get(show).url));
			$.append($$anchor, media_controller);
		};

		$.if(node_1, ($$render) => {
			if (browser) $$render(consequent);
		});
	}

	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var node_4 = $.child(div_5);

	ShareButton(node_4, {
		get show() {
			return $.get(show);
		}
	});

	var node_5 = $.sibling(node_4, 2);

	ListenLinks(node_5, {
		get show() {
			return $.get(show);
		}
	});

	var a = $.sibling(node_5, 2);
	var node_6 = $.child(a);

	Icon(node_6, { name: 'download' });
	$.reset(a);
	$.reset(div_5);

	var node_7 = $.sibling(div_5, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_6 = root_1();
			var button = $.child(div_6);
			var node_8 = $.sibling(button, 2);

			ShareActions(node_8, {
				get show() {
					return $.get(show);
				},
				timestamp: false
			});

			$.reset(div_6);
			$.delegated('click', button, toggle_share);
			$.transition(3, div_6, () => fade, () => ({ duration: 200 }));
			$.append($$anchor, div_6);
		};

		$.if(node_7, ($$render) => {
			if ($episode_share_status()) $$render(consequent_1);
		});
	}

	$.reset(figure);
	$.reset(div);

	var node_9 = $.sibling(div, 2);

	Toaster(node_9, {});

	$.template_effect(
		($0) => {
			styles = $.set_style(span, '', styles, { '--transition-name': `show-date-${$.get(show).number ?? ''}` });
			$.set_text(text, $.get(show).number);
			styles_1 = $.set_style(p, '', styles_1, { '--transition-name': `show-date-${$.get(show).number ?? ''}` });
			$.set_text(text_1, $0);
			$.set_text(text_2, $.get(show).title);
			$.set_attribute(a, 'href', $.get(show).url);
		},
		[() => format(new Date($.get(show).date), 'MMMM do, yyyy')]
	);

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);