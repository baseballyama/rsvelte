import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { player } from '$state/player';
import { player_window_status } from '$state/player_window_status';
import AlbumArt from './AlbumArt.svelte';
import get_show_path from '$utilities/slug';
import Icon from '../Icon.svelte';
import ShareButton from '../share/HairButton.svelte';
import { onMount } from 'svelte';

var root = $.from_html(`<p class="svelte-kzll0m"><a id="player_show_title" class="svelte-kzll0m"> </a></p>`);
var root_1 = $.from_html(`<media-control-bar><div class="media-controls svelte-kzll0m"><media-seek-backward-button><span slot="icon"><!></span></media-seek-backward-button> <media-play-button><span slot="play" style="--icon_size: 26px;"><!></span> <span slot="pause" style="--icon_size: 26px;"><!></span></media-play-button> <media-seek-forward-button><span slot="icon"><!></span></media-seek-forward-button></div> <div class="media-range svelte-kzll0m"><media-time-display></media-time-display> <div class="media-range-bookmarks svelte-kzll0m"><media-time-range></media-time-range></div> <media-duration-display></media-duration-display></div> <div class="media-sound"><media-playback-rate-button></media-playback-rate-button> <media-mute-button></media-mute-button> <media-volume-range></media-volume-range></div></media-control-bar>`, 2);
var root_2 = $.from_html(`<section><div class="window-controls svelte-kzll0m"><!> <button class="minimize svelte-kzll0m"><!></button> <button class="close svelte-kzll0m" aria-label="Close Player" title="Close Player">×</button></div> <div class="player-container svelte-kzll0m"><!> <div style="flex-grow: 1;"><!> <media-controller><audio slot="media" preload="metadata" crossorigin="anonymous"></audio> <!></media-controller></div></div></section>`, 2);

export default function Player($$anchor, $$props) {
	$.push($$props, true);

	const $player_window_status = () => $.store_get(player_window_status, '$player_window_status', $$stores);
	const $player = () => $.store_get(player, '$player', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	onMount(() => {
		// Load latest show by default
		player.initialize($$props.initial_show);
	});

	let mix_max_verb = $.derived(() => $player_window_status() === 'MINI' ? 'Maximize' : 'Minimize');
	var section = root_2();
	var div = $.child(section);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			ShareButton($$anchor, {
				get show() {
					return $player().current_show;
				}
			});
		};

		$.if(node, ($$render) => {
			if ($player().current_show) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);
	var node_1 = $.child(button);

	Icon(node_1, { name: 'minimize' });
	$.reset(button);

	var button_1 = $.sibling(button, 2);

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			AlbumArt($$anchor, {});
		};

		$.if(node_2, ($$render) => {
			if ($player_window_status() === 'ACTIVE') $$render(consequent_1);
		});
	}

	var div_2 = $.sibling(node_2, 2);
	var node_3 = $.child(div_2);

	{
		var consequent_2 = ($$anchor) => {
			var p = root();
			var a = $.child(p);
			var text = $.only_child(a);

			$.reset(p);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', $0);
					$.set_text(text, `Show #${$player().current_show?.number ?? ''} - ${$player().current_show?.title ?? ''}`);
				},
				[() => get_show_path($player().current_show)]
			);

			$.append($$anchor, p);
		};

		$.if(node_3, ($$render) => {
			if ($player().current_show) $$render(consequent_2);
		});
	}

	var media_controller = $.sibling(node_3, 2);

	$.set_custom_element_data(media_controller, 'audio', true);
	$.set_custom_element_data(media_controller, 'nohotkeys', true);
	$.set_style(media_controller, '--media-range-track-height: 5px; --media-range-thumb-height: 15px; --media-range-thumb-border-radius: 0;	--media-range-track-border-radius: 5px; --media-range-bar-color: var(--primary);--media-background-color: transparent; --media-control-background: transparent; width: 100%; --media-font-family: var(--body-font-family); --media-control-hover-background: transparent; ');
	$.set_class(media_controller, 1, 'svelte-kzll0m');

	var audio = $.child(media_controller);

	$.bind_this(audio, ($$value) => $.store_mutate(player, $.untrack($player).audio = $$value, $.untrack($player)), () => $player()?.audio);

	var node_4 = $.sibling(audio, 2);

	{
		var consequent_3 = ($$anchor) => {
			var media_control_bar = root_1();

			$.set_class(media_control_bar, 1, 'media-bar svelte-kzll0m');

			var div_3 = $.child(media_control_bar);
			var media_seek_backward_button = $.child(div_3);
			var span = $.child(media_seek_backward_button);
			var node_5 = $.child(span);

			Icon(node_5, { name: 'back-30' });
			$.reset(span);
			$.reset(media_seek_backward_button);

			var media_play_button = $.sibling(media_seek_backward_button, 2);
			var span_1 = $.child(media_play_button);
			var node_6 = $.child(span_1);

			Icon(node_6, { name: 'play' });
			$.reset(span_1);

			var span_2 = $.sibling(span_1, 2);
			var node_7 = $.child(span_2);

			Icon(node_7, { name: 'pause' });
			$.reset(span_2);
			$.reset(media_play_button);

			var media_seek_forward_button = $.sibling(media_play_button, 2);
			var span_3 = $.child(media_seek_forward_button);
			var node_8 = $.child(span_3);

			Icon(node_8, { name: 'forward-30' });
			$.reset(span_3);
			$.reset(media_seek_forward_button);
			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var media_time_display = $.child(div_4);

			$.set_class(media_time_display, 1, 'svelte-kzll0m');

			var div_5 = $.sibling(media_time_display, 2);
			var media_time_range = $.child(div_5);

			$.set_class(media_time_range, 1, 'svelte-kzll0m');

			$.set_style(media_time_range, '', {}, {
				'--media-range-bar-color': 'var(--white)',
				'--media-range-thumb-background': 'var(--primary)'
			});

			$.reset(div_5);

			var media_duration_display = $.sibling(div_5, 2);

			$.set_class(media_duration_display, 1, 'svelte-kzll0m');
			$.reset(div_4);
			$.next(2);
			$.reset(media_control_bar);
			$.append($$anchor, media_control_bar);
		};

		$.if(node_4, ($$render) => {
			if ($player_window_status() === 'ACTIVE') $$render(consequent_3);
		});
	}

	$.reset(media_controller);
	$.bind_this(media_controller, ($$value) => $.store_mutate(player, $.untrack($player).media_controller = $$value, $.untrack($player)), () => $player()?.media_controller);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(section);

	$.template_effect(() => {
		$.set_class(section, 1, `player ${$player_window_status() ?? ''} ${$player().status ?? ''}`, 'svelte-kzll0m');
		$.set_attribute(button, 'aria-label', `${$.get(mix_max_verb)} Player`);
		$.set_attribute(button, 'title', `${$.get(mix_max_verb)} Player`);
	});

	$.delegated('click', button, function (...$$args) {
		player.toggle_minimize?.apply(this, $$args);
	});

	$.delegated('click', button_1, function (...$$args) {
		player.close?.apply(this, $$args);
	});

	$.event('timeupdate', audio, function (...$$args) {
		player.ontimeupdate?.apply(this, $$args);
	});

	$.event('play', audio, function (...$$args) {
		player.onplay?.apply(this, $$args);
	});

	$.event('ended', audio, function (...$$args) {
		player.onended?.apply(this, $$args);
	});

	$.event('pause', audio, function (...$$args) {
		player.onpause?.apply(this, $$args);
	});

	$.append($$anchor, section);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);